import { useEffect, useRef, useState } from 'react';
import './App.css';
import Message from './component/Message';
import {Box, Button, Container, Heading, HStack, Image, Input, Text, VStack} from '@chakra-ui/react'
import {signOut, onAuthStateChanged, getAuth ,GoogleAuthProvider,signInWithPopup} from "firebase/auth"
import {app} from "./firebase"
import {getFirestore,addDoc, collection, serverTimestamp, onSnapshot, query, orderBy} from "firebase/firestore"




function App() {
  const [user,setUser] = useState(false)
  const [message,setMessage]= useState("")
  const [messages,setMessages] = useState([])
  const divForScroll =useRef(null)
  const auth =getAuth(app)
  const db = getFirestore(app)
  
  let url ="https://i.graphicmama.com/blog/wp-content/uploads/2019/11/13123619/Yule-grunge-style-black-and-white-illustration.png"



  const loginHandler = (req, res) =>{
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth,provider)
}
  const logoutHandler =()=>{signOut(auth)}



  const submitHandler =async(e)=>{
    e.preventDefault();
    try {
      setMessage("");
      await addDoc(collection(db,"Messages"),{
        text:message,
        uid:user.uid,
        uri:user.photoURL,
        createdAt:serverTimestamp()
      })
      divForScroll.current.scrollIntoView({behavior:"smooth"})
    } catch (error) {
      alert(error)
    }
}

  useEffect(()=>{
    const q = query(collection(db,"Messages"),orderBy("createdAt","ascending"))
    const unSubscribe =  onAuthStateChanged(auth,(data)=>{
        setUser(data)
    });
    const unSubscribeForMessage = onSnapshot(q,(Snap)=>{
          setMessages(Snap.docs.map((item)=>{
            const id =item.id;
            return {id, ...item.data()}
          }))
      })
    return ()=>{
      unSubscribe();
      unSubscribeForMessage();
    }
  },[])
  
  return (
    <Box p={"0vh"} bg={"blue.100"}>
      {
        user?(     
      <Container  bg={"black"} h={"110vh"} borderRadius={"base"}>
        <VStack p={"15px"} h={"full"}>
          <Button padding={"15px"} colorScheme={"green"} w={"100%"}>AstraChat</Button>
            <VStack pt={"5px"} h="full" w={"full"} overflowY="auto">
              {
                messages.map(item=>(
                  <Message 
                   key={item.id}
                   user={item.uid === user.uid?"me":"other"}
                   text={item.text}
                   uri={item.uri} 
                   />
                ))
              }
              <div ref={divForScroll}></div>
            </VStack>
              <form onSubmit={submitHandler} style={{width:"100%", paddingBottom:"15px"}}>
                <HStack>
                  <Input value={message} onChange={(e)=>setMessage(e.target.value)} variant={"green"} placeholder='Write a Message !' />
                  <Button  colorScheme={"green"} type='submit'>Send</Button>
                </HStack>
              </form>
          <Button padding={"15px"} onClick={logoutHandler} colorScheme={"red"} w={"100%"}>LogOut</Button>
        </VStack>
      </Container>
      ):<VStack  h="100vh">
          <Container p={"5px"} bg={"green.600"} h={"100vh"} display={"flex"} flexDirection={"column"}>
             <VStack p={"1.5rem"} alignItems={"left"} backgroundColor={"black"} h={"full"} w={"full"} borderRadius={"base"} >
              <Text  w={"full"} onClick={loginHandler} color="white">AstraChat</Text>
              <Image pt={"2.5rem"} pb={"2rem"} borderRadius={"base"} src={url}></Image>
              <Heading position={"relative"} mt="70vh" color={"white"}>Stay Connected with your friends and family</Heading>
              <Text color="white" ml="2rem" fontWeight={"light"} pb={"1rem"}>Secure, private messaging</Text>
              <Button ml="2rem" position={"relative"} w={"80%"} onClick={loginHandler} colorScheme={"green"}>Get Started</Button>
             </VStack>
          </Container>
        </VStack>
      }
    </Box>
  );
}

export default App;
