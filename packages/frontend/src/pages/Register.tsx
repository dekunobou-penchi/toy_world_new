import type { Gender } from "@game/shared";
import { useState, useRef, useEffect } from "react";
import { GameClient } from "../ws/client";
import { ServerMessage } from "@game/shared";
import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { useNavigate } from "react-router-dom";


export function Register() {


  const [name, setName] = useState('');        // 名前（初期値: 空文字）
  const [age, setAge] = useState(20);          // 年齢（初期値: 20）
  const [gender, setGender] = useState<'male' | 'female' | 'na'>('na');
  const GENDER_OPTIONS: { value: Gender; label: string }[] =[
    {value: 'male', label: '男性'},
    {value: 'female', label: '女性'},
    {value: 'na', label: '無回答'},
  ];

  const ctx = useContext(GameContext);
  if (!ctx){
    throw new Error('GameContext が見つかりません（Provider の中で使ってください）');
  }

  const navigate = useNavigate();
  useEffect(() => {
    if (ctx.me) {
      navigate('/play');
    }
  }, [ctx.me, navigate]);
  

  function handleJoin(){
    const client = ctx?.client;
    if(!client) {
      console.warn('まだ接続できていません')
      return;
    }

    client.send({
      type: "join",
      profile: {
        name,
        gender,
        age,
        isAgent: false,
      },
    });

  }

  return (
    <div>
      <h2>参加登録</h2>
      <div>
        <label>名前: </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label>年齢: </label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.valueAsNumber)}
        />
      </div>

      {/* <div>
        <input type="radio" 
          id="gender-male"
          name="gender"
          value="male"
          checked={gender === 'male'}
          onChange={(e) => setGender(e.target.value as Gender)}
        />
        <label htmlFor="gender-male">male</label>
      </div>

      <div>
        <input type="radio" 
          id="gender-female"
          name="gender"
          value="female"
          checked={gender === 'female'}
          onChange={(e) => setGender(e.target.value as Gender)}
        />
        <label htmlFor="gender-female">female</label>
      </div>

      <div>
        <input type="radio" 
          id="gender-na"
          name="gender"
          value="na"
          checked={gender === 'na'}
          onChange={(e) => setGender(e.target.value as Gender)}
        />
        <label htmlFor="gender-na">na</label>
      </div> */}

      {GENDER_OPTIONS.map((opt) => (
        <div key={opt.value}>
          <input
            type="radio"
            id={`gender-${opt.value}`}
            name="gender"
            value={opt.value}
            checked={gender === opt.value}
            //asは型安全を壊す可能性が高いので要注意
            onChange={(e) => setGender(e.target.value as Gender)}
            />
            <label htmlFor={`gender-${opt.value}`}>{opt.label}</label>
        </div>
      ))}

      <button onClick={handleJoin}>参加</button>

    </div>
    
  );
}