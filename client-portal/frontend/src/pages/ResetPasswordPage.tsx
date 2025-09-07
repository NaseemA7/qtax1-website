import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';


export default function ResetPasswordPage(){
const [params] = useSearchParams();
const token = params.get('token') || '';
const [pw, setPw] = useState('');
const [msg, setMsg] = useState('');


async function submit(){
try{
await api.post('/auth/reset-password', { token, newPassword: pw });
setMsg('Password updated. You can close this tab and login.');
}catch(e:any){ setMsg(e?.response?.data?.error || 'Error resetting password'); }
}


return (
<div style={{ maxWidth: 360, margin: '80px auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
<h2>Reset Password</h2>
<input type="password" placeholder="New password" value={pw} onChange={e=>setPw(e.target.value)} />
<button onClick={submit}>Set new password</button>
<div>{msg}</div>
</div>
);
}