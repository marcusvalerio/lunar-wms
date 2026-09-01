export default function AcessoPage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <p className="type-label text-steel">Administração · Acesso</p>
        <h1 className="type-h1 mt-1 text-navy">Acesso</h1>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-mist p-5">
        <p className="type-body-small text-steel">
          Usuários, perfis, permissões e escopos dependem de autenticação real, que ainda não existe nesta fase do
          produto (nenhum login, sem OAuth, sem sessão de usuário). Construir essas telas agora significaria simular
          usuários que não existem de verdade — por isso ficam de fora até a autenticação real ser implementada.
        </p>
        <p className="type-body-small text-steel">
          O que existe hoje no lugar disso é o seletor de experiência, disponível no cabeçalho e documentado em{" "}
          <span className="type-technical">Administração › Configuração</span>. A arquitetura já foi construída para
          essa transição acontecer sem reescrever telas: o papel selecionado hoje (<span className="type-technical">selectedRole</span>)
          será substituído por (<span className="type-technical">authenticatedUser.role</span>) quando o login real existir.
        </p>
      </div>
    </div>
  );
}
