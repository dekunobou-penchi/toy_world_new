import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Register } from "./pages/Register";
import { Admin } from "./pages/Admin";
import { Player } from "./pages/Player";
import { GameProvider } from "./context/GameContext";


export function App() {
    return (
        // <div>
        //     <h1>Game</h1>
        //     <p>フロントエンド起動</p>
        // </div>
        <GameProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Register />} />
                    <Route path="/play" element={<Player />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </BrowserRouter>
        </GameProvider>
    );
}