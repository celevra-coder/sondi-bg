// SONDI_78ES_NATIONAL_SOIL_READER
// Server-side reader for locally stored SoilGrids rasters.
// Does not alter the national lithology or depth engines.

import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import {fromArrayBuffer} from "geotiff";
import {isSondiLithologyLocationRegistered}
  from "./sondi-regional-report";
import {createSondiSoilGridSummary}
  from "./sondi-national-soil-classifier";

type SoilTile = {
  id: string;
  bounds: {
    min_lon:number;
    min_lat:number;
    max_lon:number;
    max_lat:number;
  };
};

type SoilIndex = {
  version:string;
  tiles:SoilTile[];
};

export type SondiNationalSoilResult = {
  status:"TARGET_GRID_CELL";
  tile_id:string;
  coordinate_lat:number;
  coordinate_lon:number;
  sampled_cell_lat:number;
  sampled_cell_lon:number;
  source_depth_cm:[number,number];
  summary:NonNullable<
    ReturnType<typeof createSondiSoilGridSummary>
  >;
};

const ROOT=path.join(
  process.cwd(),
  "data","soil-lithology","runtime","soilgrids"
);

const PROPS=["clay","sand","silt","phh2o","cfvo"] as const;

let indexPromise:Promise<SoilIndex>|undefined;

function getIndex():Promise<SoilIndex> {
  if (!indexPromise) {
    indexPromise=fs.readFile(
      path.join(ROOT,"index.json"),"utf8"
    ).then(text=>{
      const index=JSON.parse(text) as SoilIndex;
      if(index.version!=="78ES" || !Array.isArray(index.tiles)){
        throw new Error("Invalid SONDI soil index");
      }
      return index;
    }).catch(error=>{
      indexPromise=undefined;
      throw error;
    });
  }
  return indexPromise;
}

type Layer={
  width:number;
  height:number;
  bbox:number[];
  values:ArrayLike<number>;
  nodata:number|null;
};

async function readLayer(
  tileId:string,
  property:typeof PROPS[number]
):Promise<Layer> {
  const filename=path.join(
    ROOT,"tiles",tileId+"_"+property+"_0-5cm.tif"
  );

  const bytes=await fs.readFile(filename);
  const buffer=new Uint8Array(bytes).buffer;
  const tiff=await fromArrayBuffer(buffer);
  const image=await tiff.getImage();
  const rasters=await image.readRasters();

  return {
    width:image.getWidth(),
    height:image.getHeight(),
    bbox:image.getBoundingBox(),
    values:rasters[0],
    nodata:image.getGDALNoData()
  };
}

export async function getSondiNationalSoilAtPoint(
  latitude:number,
  longitude:number
):Promise<SondiNationalSoilResult|null> {
  if(
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude<40 || latitude>45 ||
    longitude<19 || longitude>30
  ) return null;

  // Reuse the exact national activation polygons.
  if(!isSondiLithologyLocationRegistered(latitude,longitude)){
    return null;
  }

  const index=await getIndex();

  const tile=index.tiles.find(t=>
    longitude>=t.bounds.min_lon &&
    longitude<t.bounds.max_lon &&
    latitude>=t.bounds.min_lat &&
    latitude<t.bounds.max_lat
  );

  if(!tile) return null;

  const layers=await Promise.all(
    PROPS.map(p=>readLayer(tile.id,p))
  );

  const first=layers[0];
  const [xmin,ymin,xmax,ymax]=first.bbox;

  if(
    longitude<xmin || longitude>=xmax ||
    latitude<ymin || latitude>ymax
  ) return null;

  if(!layers.every(r=>
    r.width===first.width &&
    r.height===first.height &&
    r.bbox.every((v,i)=>Math.abs(v-first.bbox[i])<0.00001)
  )) {
    throw new Error("SoilGrids raster alignment mismatch");
  }

  const x=Math.max(0,Math.min(first.width-1,
    Math.floor(
      (longitude-xmin)/(xmax-xmin)*first.width
    )
  ));

  const y=Math.max(0,Math.min(first.height-1,
    Math.floor(
      (ymax-latitude)/(ymax-ymin)*first.height
    )
  ));

  const pixelIndex=y*first.width+x;
  const raw:Record<string,number>={};

  for(let i=0;i<PROPS.length;i++){
    const layer=layers[i];
    const value=Number(layer.values[pixelIndex]);

    if(
      !Number.isFinite(value) ||
      (layer.nodata!==null && value===layer.nodata)
    ) return null;

    raw[PROPS[i]]=value;
  }

  if(
    raw.clay<=0 ||
    raw.sand<=0 ||
    raw.silt<=0 ||
    raw.phh2o<30 ||
    raw.phh2o>100 ||
    raw.cfvo<0
  ) return null;

  const sum=raw.clay+raw.sand+raw.silt;
  if(sum<970 || sum>1030) return null;

  const values={
    clay_percent:raw.clay/10,
    sand_percent:raw.sand/10,
    silt_percent:raw.silt/10,
    ph:raw.phh2o/10,
    coarse_fragments_vol_percent:raw.cfvo/10
  };

  const summary=createSondiSoilGridSummary(
    values,"TARGET_GRID_CELL",0
  );

  if(!summary) return null;

  return {
    status:"TARGET_GRID_CELL",
    tile_id:tile.id,
    coordinate_lat:latitude,
    coordinate_lon:longitude,
    sampled_cell_lon:xmin+(x+0.5)*(xmax-xmin)/first.width,
    sampled_cell_lat:ymax-(y+0.5)*(ymax-ymin)/first.height,
    source_depth_cm:[0,5],
    summary
  };
}
