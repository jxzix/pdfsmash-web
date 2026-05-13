'use client'
import { useEffect } from 'react'
import { setPremium } from '../../lib/api'

export default function Success() {
  useEffect(() => { setPremium() }, [])
  return (
    <main style={{minHeight:'100vh',background:'#030712',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem'}}>
      <div style={{textAlign:'center',maxWidth:'28rem'}}>
        <div style={{fontSize:'3.75rem',marginBottom:'1.5rem'}}>🎉</div>
        <h1 style={{color:'#fff',fontWeight:900,fontSize:'1.875rem',marginBottom:'0.75rem'}}>You're unlocked!</h1>
        <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'2rem'}}>Unlimited PDF compressions forever.</p>
        <a href="/" style={{display:'inline-block',background:'#E24B4A',color:'#fff',fontWeight:700,padding:'1rem 2rem',borderRadius:'0.75rem',textDecoration:'none'}}>
          ⚡ Start compressing
        </a>
      </div>
    </main>
  )
}
