import { getWorld } from "./world.js";

import { GameParams } from "@game/shared";

let flag:boolean = false;
export function createTickTimer(params: GameParams): void {

    const world = getWorld();
    if(flag) {
        return;
    }


    if(!world.running){
        flag = false;
        return;
    }
    flag = true;

    Tick(params.tickIntervalSec*1000);


}

function Tick(params: number ): void{
    const world = getWorld();
    
    if(!world.running){
        flag = false;
        return;
    } 
    
    console.log('[Tick]');
    setTimeout(() => {
        Tick(params);
    }, params);
}