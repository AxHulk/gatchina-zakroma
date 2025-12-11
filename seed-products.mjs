import fs from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

async function main() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  // Read CSV file
  const csvContent = fs.readFileSync('./products.csv', 'utf-8');
  const lines = csvContent.split('\n');
  
  // Parse header
  const header = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
  
  // Parse products
  const products = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV line with semicolon delimiter and quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ';' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    header.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    
    // Extract clean description (remove HTML tags)
    let description = row['Description'] || '';
    description = description.replace(/<[^>]*>/g, '').trim();
    
    // Parse price as integer (cents)
    let price = parseFloat(row['Price'] || '0');
    price = Math.round(price * 100); // Store as cents
    
    const product = {
      sku: row['SKU'] || `SKU-${i}`,
      category: row['Category'] || 'Другое',
      title: row['Title'] || 'Без названия',
      description: description,
      fullText: row['Text'] || '',
      imageUrl: row['Photo'] || '',
      price: price,
      quantity: parseInt(row['Quantity'] || '0', 10),
      unit: row['Unit'] || 'KGM'
    };
    
    products.push(product);
  }
  
  console.log(`Parsed ${products.length} products`);
  
  // Insert products into database using backticks for column names
  for (const product of products) {
    await connection.execute(
      `INSERT INTO products (\`sku\`, \`category\`, \`title\`, \`description\`, \`fullText\`, \`imageUrl\`, \`price\`, \`quantity\`, \`unit\`) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.sku,
        product.category,
        product.title,
        product.description,
        product.fullText,
        product.imageUrl,
        product.price,
        product.quantity,
        product.unit
      ]
    );
  }
  
  console.log('Products imported successfully!');
  
  await connection.end();
}

main().catch(console.error);
