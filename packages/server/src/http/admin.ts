import { Router } from "express";
import { getWorld, initWorld, startGame, stopGame } from "../game/world.js";
import { DEFAULT_GAME_PARAMS } from "@game/shared";

import { createTickTimer } from "../game/ticker.js";

export function createAdminRouter(): Router {
    const router = Router();
    router.post('/init', (_req, res) => {
        initWorld(DEFAULT_GAME_PARAMS);
        res.json({ ok: true});
        }
    );

    router.post('/start', (_req, res) => {
        const ok = startGame();
        if (!ok) {
            res.status(400).json({ ok: false, error: 'not_initialized'});
            return;
        }
        const world = getWorld();
        if(world.params === null) {
            res.status(500).json({ok: false, error: 'server_error'});
            return;
        }
        createTickTimer(world.params);
        res.json({ok: true});
    });

    router.post('/stop', (_req, res) => {
        stopGame();
        
        res.json({ok: true});
    })

    return router;
}