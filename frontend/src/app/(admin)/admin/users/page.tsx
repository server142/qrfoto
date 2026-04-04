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

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${getApiUrl()}/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
        <p className="text-white/50 mt-1">Lista global de clientes y administradores.</p>
      </div>

      <Card className="bg-zinc-950 border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Rol</TableHead>
              <TableHead className="text-white">Idioma</TableHead>
              <TableHead className="text-white">Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: any) => (
              <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02]">
                <TableCell className="font-medium text-white">
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell className="text-white/70">{user.email}</TableCell>
                <TableCell>
                  <Badge className={
                    user.role === 'SuperAdmin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    user.role === 'Admin' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                  }>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="uppercase text-xs font-bold text-white/50">{user.preferred_language}</TableCell>
                <TableCell className="text-white/50 text-xs">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
