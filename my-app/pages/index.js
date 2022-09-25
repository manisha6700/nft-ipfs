import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { Contract, providers, utils } from "ethers";
import {NFT_CONTRACT_ADDRESS, abi} from "../constants/index";

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3ModalRef = useRef();

  const getProviderOrSigner = async(needSigner = false) =>{
    try{
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const {chainId} = await web3Provider.getNetwork();
      if(chainId !== 80001){
        window.alert("Change the network to Mumbai");
        throw new Error("Change the network to Mumbai");
      }

      if(needSigner = true){
        const signer = web3Provider.getSigner();
        return signer;
      }
      console.log("done")
      return web3Provider;
    }catch(err){
      console.error(err);
    }
  }

  const connectWallet = async() =>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
    }catch(err){
      console.error(err);
    }
  }

  const mint = async() => {
    try{
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const txn = await contract.mint({
        value:utils.parseEther("0.001")
      });
      setLoading(true);
      await txn.wait();
      setLoading(false);
      window.alert("You have successfully minted a NFT!!")
    }catch(err){
      console.error(err);
    }
  }

  const getTokenIdsMinted = async() => {
    try{
      const provider = await getProviderOrSigner();
      const contract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
    
    const _tokenIds = await contract.tokenIds();
    setTokenIdsMinted(_tokenIds.toString());
    }catch(err){
      console.error(err);
    }

  }

  useEffect (() => {
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions:{},
        disableInjectedProvider:false,
      })

      connectWallet();
      getTokenIdsMinted();

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5* 1000);
    }
  },[walletConnected])

  const renderButton = () =>{
    if(!walletConnected){
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet!
        </button>
      )
    }

    if(loading){
      return (
        <button className={styles.button}>
          Loading...
        </button>
      )
    }

    return (
      <button onClick={mint} className={styles.button}>
        Mint NFT 🚀
      </button>
    )
  }

  return (
    <div>
      <Head>
        <title>LW3Punks</title>
        <meta name="description" content="LW3Punks-dApp"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to LW3Punks!</h1>
          <div className={styles.description}>
            It's a NFT collection for LearnWeb3 students.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/10 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./LW3punks/1.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by LW3Punks
      </footer>
    </div>
  )
}
