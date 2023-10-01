create database dindin;

create table usuarios (
	id serial primary key,
  	nome varchar(150) not null,
  	email text not null unique,
  	senha text not null
);

drop table usuarios;

create table categorias (
  id serial primary key,
  descricao text not null
);

create table transacoes (
  id serial primary key,
	descricao text not null,
	valor integer not null, --em centavos
	data Timestamp,
	categoria_id integer not null references categorias(id),
	usuario_id integer not null references usuarios(id),
	tipo text not null -- entrada ou saída
);

insert into categorias (descricao) values
    ('Alimentação'),
    ('Assinaturas e Serviços'),
    ('Casa'),
    ('Mercado'),
    ('Cuidados Pessoais'),
    ('Educação'),
    ('Família'),
    ('Lazer'),
    ('Pets'),
    ('Presentes'),
    ('Roupas'),
    ('Saúde'),
    ('Transporte'),
    ('Salário'),
 	  ('Vendas'),
    ('Outras receitas'),
    ('Outras despesas');