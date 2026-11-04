import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
export interface Line { productId:string; qty:number }
interface Ctx { lines:Line[]; add:(id:string)=>void; setQty:(id:string,q:number)=>void; clear:()=>void; wishlist:string[]; toggleWish:(id:string)=>void }
const C = createContext<Ctx>(null!)
export const useCart = () => useContext(C)
const ls=(k:string)=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return []}}
export function CartProvider({children}:{children:ReactNode}){
  const {user}=useAuth(); const [lines,setLines]=useState<Line[]>(ls('cart')); const [wishlist,setWish]=useState<string[]>(ls('wish'))
  useEffect(()=>{ if(!user) return; (async()=>{
    const [c,w]=await Promise.all([getDoc(doc(db,'carts',user.uid)),getDoc(doc(db,'wishlists',user.uid))])
    if(c.exists()){ const r=c.data().lines as Line[]; setLines(l=>[...r,...l.filter(x=>!r.some(y=>y.productId===x.productId))]) }
    if(w.exists()) setWish(x=>Array.from(new Set([...(w.data().ids as string[]),...x]))) })() },[user])
  useEffect(()=>{ localStorage.setItem('cart',JSON.stringify(lines)); if(user) setDoc(doc(db,'carts',user.uid),{lines}) },[lines,user])
  useEffect(()=>{ localStorage.setItem('wish',JSON.stringify(wishlist)); if(user) setDoc(doc(db,'wishlists',user.uid),{ids:wishlist}) },[wishlist,user])
  const add=(id:string)=>setLines(l=>l.some(x=>x.productId===id)?l.map(x=>x.productId===id?{...x,qty:x.qty+1}:x):[...l,{productId:id,qty:1}])
  const setQty=(id:string,q:number)=>setLines(l=>q<=0?l.filter(x=>x.productId!==id):l.map(x=>x.productId===id?{...x,qty:q}:x))
  return <C.Provider value={{lines,add,setQty,clear:()=>setLines([]),wishlist,toggleWish:id=>setWish(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id])}}>{children}</C.Provider>
}
