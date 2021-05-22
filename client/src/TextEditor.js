import React from 'react'
import { useEffect,useRef, useState, useCallback } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const COMMON_INTERVAL = 3000
const TOOLBAR_OPTIONS = 
[[{ header: [1,2,3,4,5,6, false] }],
    [{ font: [] }],
    [{ list:'ordered'},{list:'bullet' }],
    ["bold","italic","underline"],
    [{ color: [] }, {background: []}],
    [{script: 'sub'}, {script:'super'}],
    [{align:[]}],
    [{ 'indent': '-1'}, { 'indent': '+1' }],           
    ["image", "blockquote", "code-block"],
    ["clean"],
]


function TextEditor() {
    const {id: documentId} = useParams()
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    


    useEffect(() =>{
    const mySocket = io("http://localhost:3001")
    setSocket(mySocket)
    return () =>{
        mySocket.disconnect()
    }
    },[])




    useEffect(() =>{
        if( socket == null || quill == null ) return

        socket.once("load-document", document => {
            quill.setContents(document)
            quill.enable()
        })
        socket.emit('get-document', documentId)
    }, [socket, quill, documentId])



    useEffect(() => {
        if(socket == null || quill == null) return
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return 
            socket.emit("send-changes", delta)
        }
        quill.on("text-change", handler)
        return () =>{
            quill.off('text-change', handler)
        }

    }, [socket, quill])




    useEffect(() => {
        if(socket == null || quill == null) return
        const handler = delta => {
            quill.updateContents(delta)
        }
        socket.on('receive-changes', handler)

        return () =>{
            socket.off('receive-changes', handler)
        }

    }, [socket, quill])


    useEffect(() =>{
        if(socket == null || quill == null) return
        const interval = setInterval(() =>{
            socket.emit("save-document", quill.getContents())
        }, COMMON_INTERVAL)
        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])

    


    const wrapperRef = useCallback((wrapper) => {
        if(wrapper == null) return
        wrapper.innerHTML = ""
    const editor = document.createElement("div");
    wrapper.append(editor)
    const myQuill = new Quill(editor,
        {
            theme: "snow",
            modules: {
                toolbar: TOOLBAR_OPTIONS,
            }
        })
        myQuill.disable()
        myQuill.setText("Loading...")
        setQuill(myQuill)
    
},[])


    return <div className = 'container' ref = {wrapperRef}>Text Editor</div>
                
    
}

export default TextEditor
