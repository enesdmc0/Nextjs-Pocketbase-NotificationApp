import type {NextApiRequest, NextApiResponse} from 'next';
import {pb} from '../../lib/pb';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const token = req.cookies.pb_auth;
            if (!token) {
                return res.status(401).json({message: "Token not found"});
            }

            pb.authStore.save(token);
            const todos = await pb.collection('todos').getFullList();
            return res.status(200).json({todos});
        } catch (error) {
            console.error("An error occurred:", error);
            return res.status(500).json({message: "Server error"});
        }
    } else if (req.method === 'PUT') {
        try {
            const token = req.cookies.pb_auth;
            if (!token) {
                return res.status(401).json({ message: "Token not found" });
            }

            pb.authStore.save(token);


            const { id, isRead, isArchive, allArchive } = req.body;

            if (allArchive) {
                const todos = await pb.collection('todos').getFullList();
                await Promise.all(todos.map(async (todo) => {
                    await pb.collection('todos').update(todo.id, { isArchive: true });
                }));
                return res.status(200).json({ message: "All todos archived" });
            } else {
                const currentTodo = await pb.collection('todos').getOne(id);
                let updateFields: any = {};

                if (typeof isRead !== 'undefined') {
                    updateFields.isRead = isRead;
                    if (currentTodo.readDate === "") updateFields.readDate = new Date().toISOString()
                }
                if (typeof isArchive !== 'undefined') {
                    updateFields.isArchive = !isArchive;
                }

                await pb.collection('todos').update(id, updateFields);
                return res.status(200).json({ message: "Todo updated" });
            }
        } catch (error) {
            console.error("An error occurred:", error);
            return res.status(500).json({message: "Server error"});
        }
    } else {
        return res.status(405).json({message: "Method Not Allowed"});
    }
}
