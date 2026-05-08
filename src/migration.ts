import pg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const run = async () => {
  // Criamos o pool aqui diretamente para evitar erros de importação de módulos
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Ajusta o nome do ficheiro SQL se for diferente de 'payment.sql'
    const sqlPath = path.join(process.cwd(), 'src/config/payment.sql');
    
    if (!fs.existsSync(sqlPath)) {
        throw new Error(`Ficheiro não encontrado em: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('⏳ A conectar ao Render PostgreSQL...');
    await pool.query(sql);
    console.log('Tabelas criadas com sucesso!');
    
  } catch (err: any) {
    console.error('Erro durante a migração:', err.message);
  } finally {
    await pool.end();
    process.exit();
  }
};

run();