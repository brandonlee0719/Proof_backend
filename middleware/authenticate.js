import firebaseAdmin from '../services/firebase.js'
import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            console.log(decoded)
            const id = decoded.id

            // Get user from the token
            const userCollection = req.app.locals.db.collection("user")
            const user = await userCollection.findOne({id})

            if (!user) {
                //Unauthorized
                res.sendStatus(401)
                throw new Error('Noth authorized')
            }

            req.user = user

            next()
        } catch (error) {
            console.log(error)
            // Unauthorized
        }
    }
}



// export default async function (req, res, next) {
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

//         try {
//             const firebaseToken = req.headers.authorization?.split(' ')[1]
    
//             let firebaseUser;
//             if (firebaseUser) {
//                 firebaseUser = await firebaseAdmin.auth.verifyIdToken(firebaseToken)
//             }
//             console.log(firebaseUser)
    
//             if (!firebaseUser) {
//                 //unauthorized
//                 return res.sendStatus(401)
//             }
    
//             const usersCollection = req.app.locals.db.collection("user")
    
//             const user = await usersCollection.findOne({
//                 firebaseId: firebaseUser.user_id
//             })

    
//             if (!user) {
//                 //Unauthorized
//                 return res.sendStatus(401)
//             }
    
//             req.user = user
    
//             next()
//         } catch (error) {
//             //Unauthorized
//             res.sendStatus(401)
//         }
//     }
// }