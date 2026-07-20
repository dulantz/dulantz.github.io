const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const sb = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
  const { method, path, queryStringParameters, body } = event;
  const table = path.replace('/.netlify/functions/proxy/', '');

  try {
    let res;
    if (method === 'GET') {
      res = await sb.from(table).select('*').order(queryStringParameters?.order || 'created_at', { ascending: queryStringParameters?.asc !== 'false' });
    } else if (method === 'POST') {
      const data = JSON.parse(body);
      res = await sb.from(table).insert(data);
    } else if (method === 'PATCH') {
      const data = JSON.parse(body);
      const id = queryStringParameters.id;
      res = await sb.from(table).update(data).eq('id', id);
    } else if (method === 'DELETE') {
      const id = queryStringParameters.id;
      res = await sb.from(table).delete().eq('id', id);
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(res)
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    };
  }
};