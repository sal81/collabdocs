const mongoose = require('mongoose')
const Document = require("./Document")

mongoose.connect("<your mongoDB atlas url>", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});



const io = require("socket.io")(3001,{
    cors:{
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
})

const defaultVal = ""
io.on("connection", socket => {

    socket.on("get-document", async documentId =>{
        const document = await findorCreatDoc(documentId)
        socket.join(documentId)
        socket.emit("load-document", document.data)

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        })
        socket.on("save-document", async data =>{
            await Document.findByIdAndUpdate(documentId, { data })
        })

    })

})

async function findorCreatDoc(id){
    if(id == null) return
    const document = await Document.findById(id)
    if(document) return document
    return await Document.create({
        _id: id,
        data: defaultVal
    })
}