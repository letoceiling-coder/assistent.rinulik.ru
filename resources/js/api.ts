export async function api(path:string, method='GET', data?:unknown):Promise<any> {
  const token=document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content||'';
  const form=data instanceof FormData;
  const response=await fetch('/api/v1/'+path,{method,credentials:'same-origin',headers:{Accept:'application/json','X-CSRF-TOKEN':token,...(!form?{'Content-Type':'application/json'}:{})},body:data?(form?data:JSON.stringify(data)):undefined});
  const result=await response.json().catch(()=>({message:'Сервер временно недоступен.'}));
  if (!response.ok) { const errors=result.errors?Object.values(result.errors).flat().join(' '):result.message; throw new Error(response.status===419?'Сессия истекла. Обновите страницу.':errors||'Не удалось выполнить действие.'); }
  return result;
}
export const money=(v:number=0)=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:2}).format(v/100);
export const date=(v:string)=>new Date(v).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
