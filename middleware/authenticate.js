import firebaseAdmin from '../services/firebase.js'

export default async function (req, res, next) {
    try {
        const firebaseToken = req.headers.authorization?.split(' ')[1]

        let firebaseUser;
        if (firebaseUser) {
            firebaseUser = await firebaseAdmin.auth.verifyIdToken(firebaseToken)
        }

        if (!firebaseUser) {
            //unauthorized
            return res.sendStatus(401)
        }

        const usersCollection = req.app.locals.db.collection("user")

        const user = await usersCollection.findOne({
            firebaseId: firebaseUser.user_id
        })

        if (!user) {
            //Unauthorized
            return res.sendStatus(401)
        }

        req.user = user

        next()
    } catch (error) {
        //Unauthorized
        res.sendStatus(401)
    }
}