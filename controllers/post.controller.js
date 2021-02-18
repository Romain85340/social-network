const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const { uploadErrors } = require("../utils/errors.utils");


module.exports.readPost = (req, res) => {
    PostModel.find((err, docs) => {
        if(!err)
            res.send(docs);
        else
            console.log(("Erreur récuperation data : " + err));
    }).sort({ createdAt: -1 });
}

module.exports.createPost = async (req, res) => {
    let fileName;

    if(req.file !== null){
        try {
            if (
              req.file.detectedMimeType != "image/jpg" &&
              req.file.detectedMimeType != "image/png" &&
              req.file.detectedMimeType != "image/jpeg"
            )
              return res.status(400).send({errors: "L'image n'est pas valide"})
              // throw Error("invalid file");
            if (req.file.size > 1500000) 
              return res.status(400).send({errors: "L'image dépasse 1.5Mo"})
              // throw Error("max size");
          } catch (err) {
            const errors = uploadErrors(err);
            return res.status(201).json({ errors });
          }
          fileName = req.body.posterId + Date.now() + '.jpg'

          await pipeline(
            req.file.stream,
            fs.createWriteStream(
              `${__dirname}/../client/public/uploads/posts/${fileName}`
            )
          );
    }

    const newPost = new PostModel({
        posterId: req.body.posterId,
        message: req.body.message,
        picture: req.file !== null ? "./uploads/posts/" + fileName : "",
        video: req.body.video,
        likers: [],
        comments: [],
    })

    try {
        const post = await newPost.save();
        return res.status(201).json(post);
    } catch(err){
        return res.status(400).send(err);
    }
}

module.exports.updatePost = (req, res) => {
    if(!ObjectID.isValid(req.params.id)){
        return res.status(400).send("ID inconnu : " + req.params.id)
    } else {
        const updateRecord = {
            message: req.body.message
        }

        PostModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateRecord },
            { new: true },
            (err, docs) => {
                if(!err)
                    res.send(docs)
                else
                    console.log("Erreur lors de la MAJ : " + err);
            }
        )
    }
}

module.exports.deletePost = (req, res) => {
    if(!ObjectID.isValid(req.params.id)){
        return res.status(400).send("ID inconnu : " + req.params.id)
    } else {
        PostModel.findByIdAndRemove(
            req.params.id,
            (err, docs) => {
                if(!err) res.send(docs);
                else console.log("Erreur lors de la suppression : " + err);
            }
        )
    }
}

module.exports.likePost = async (req, res) => {
    if(!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID inconnu : " + req.params.id)

    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likers: req.body.id }
            },
            { new: true },
            (err, docs) => {
                if(err) return res.status(400).send(err);
            }
        );
        await UserModel.findByIdAndUpdate(
            req.body.id,
            { $addToSet: { likes: req.params.id }},
            { new: true },
            (err, docs) => {
                if(!err) res.send(docs)
                else return res.status(400).send(err);
            }
        )
    } catch(err){
        return res.status(400).send(err);
    }
}

module.exports.unlikePost = async (req, res) => {
    if(!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID inconnu : " + req.params.id)

    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id }
            },
            { new: true },
            (err, docs) => {
                if(err) return res.status(400).send(err);
            }
        );
        await UserModel.findByIdAndUpdate(
            req.body.id,
            { $pull: { likes: req.params.id }},
            { new: true },
            (err, docs) => {
                if(!err) res.send(docs)
                else return res.status(400).send(err);
            }
        )
    } catch(err){
        return res.status(400).send(err);
    }
}

module.exports.commentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
            $push: {
                comments: {
                commenterId: req.body.commenterId,
                commenterPseudo: req.body.commenterPseudo,
                text: req.body.text,
                timestamp: new Date().getTime(),
                },
            },
            },
            { new: true },
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        );
    } catch (err) {
      return res.status(400).send(err);
    }
};

module.exports.editCommentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
        return PostModel.findById(req.params.id, (err, docs) => {
                const theComment = docs.comments.find((comment) =>
                comment._id.equals(req.body.commentId)
            );
    
            if (!theComment) return res.status(404).send("Commentaire n'existe pas");
            theComment.text = req.body.text;
    
            return docs.save((err) => {
                if (!err) return res.status(200).send(docs);
                return res.status(500).send(err);
            });
        });
    } catch (err) {
      return res.status(400).send(err);
    }
};

module.exports.deleteCommentPost = (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
    
    try {
        return PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        _id: req.body.commentId
                    }
                }
            },
            { new: true },
            (err, docs) => {
                if(!err) return res.send(docs);
                else return res.status(400).send(err)
            }
        )
    } catch(err){
        return res.status(400).send(err)
    }
};