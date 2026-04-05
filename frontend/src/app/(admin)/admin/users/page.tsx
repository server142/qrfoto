"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/lib/api";
import { Shield, ShieldAlert, Clock, Globe, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    fetch(`${getApiUrl()}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setUsers(data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    await fetch(`${getApiUrl()}/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    fetchUsers();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight italic uppercase italic">Seguridad y Gestión de Usuarios</h2>
        <p className="text-white/50 mt-1 uppercase text-[10px] tracking-widest font-black">Monitoreo de registros e integridad del sistema.</p>
      </div>

      <Card className="bg-zinc-950 border-white/10 overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest px-6 h-14">Nombre / Email</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest px-6 h-14 text-center">Estado</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest px-6 h-14">IP Registro</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest px-6 h-14">Registro</TableHead>
              <TableHead className="text-white font-black uppercase text-[10px] tracking-widest px-6 h-14 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} className={`border-white/5 transition-colors ${user.status === 'Blocked' ? 'bg-red-500/5' : 'hover:bg-white/[0.01]'}`}>
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-black text-white italic">{user.first_name} {user.last_name}</span>
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center px-6">
                  <Badge className={
                    user.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                  }>
                    {user.status || 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-400 opacity-50" />
                    <span className="text-xs font-mono text-white/60 tracking-tight">{user.registration_ip || '---'}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <div className="flex flex-col">
                      <span className="text-xs text-white/50">{new Date(user.created_at).toLocaleDateString()}</span>
                      <span className="text-[9px] text-white/30 font-black">{new Date(user.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleStatus(user.id, user.status || 'Active')}
                    className={`h-9 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${user.status === 'Blocked'
                      ? 'text-green-400 hover:bg-green-500/10'
                      : 'text-red-400 hover:bg-red-500/10'
                      }`}
                  >
                    {user.status === 'Blocked' ? <><CheckCircle2 className="w-3 h-3 mr-2" /> Desbloquear</> : <><Ban className="w-3 h-3 mr-2" /> Bloquear</>}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
