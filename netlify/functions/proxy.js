const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event) => {
    const { httpMethod, path, queryStringParameters, body } = event;

    // 跨域头
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    };

    // 预检请求
    if (httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    // 从路径中提取表名：/api/members → members
    const table = path.replace('/api/', '');

    try {
        let result;

        if (httpMethod === 'GET') {
            // 查询数据
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
            result = data;

        } else if (httpMethod === 'POST') {
            // 插入数据
            const payload = JSON.parse(body);
            const { data, error } = await supabase
                .from(table)
                .insert([payload])
                .select();

            if (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
            result = data;

        } else if (httpMethod === 'DELETE') {
            // 删除数据
            const id = queryStringParameters?.id;
            if (!id) {
                return { statusCode: 400, headers, body: JSON.stringify({ error: '缺少 id 参数' }) };
            }
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) {
                return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
            }
            result = { success: true };

        } else {
            return { statusCode: 405, headers, body: JSON.stringify({ error: '方法不支持' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result),
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message }),
        };
    }
};