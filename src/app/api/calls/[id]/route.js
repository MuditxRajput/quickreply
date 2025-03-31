// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// export async function GET(req, { params }) {
//     const { id } = params;
//     const { data, error } = await supabase
//         .from('calls')
//         .select('*, user:users(*), contact:contacts(*)')
//         .eq('id', id)
//         .single();
    
//     if (error) return Response.json({ error: error.message }, { status: 400 });
//     return Response.json(data, { status: 200 });
// }

// export async function PATCH(req, { params }) {
//     const { id } = params;
//     const body = await req.json();
    
//     const { data, error } = await supabase
//         .from('calls')
//         .update(body)
//         .eq('id', id)
//         .select()
//         .single();
    
//     if (error) return Response.json({ error: error.message }, { status: 400 });
//     return Response.json(data, { status: 200 });
// }

// export async function DELETE(req, { params }) {
//     const { id } = params;
//     const { error } = await supabase.from('calls').delete().eq('id', id);
    
//     if (error) return Response.json({ error: error.message }, { status: 400 });
//     return Response.json({ message: 'Call deleted successfully' }, { status: 200 });
// }
