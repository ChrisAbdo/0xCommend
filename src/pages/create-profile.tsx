import { Fragment, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import Web3 from "web3";
import Commend from "@/backend/build/contracts/Commend.json";
import NFT from "@/backend/build/contracts/NFT.json";
import {
  InformationCircleIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion } from "framer-motion";
import { useToast } from "@/lib/hooks/use-toast";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const ipfsClient = require("ipfs-http-client");
const projectId = "2FdliMGfWHQCzVYTtFlGQsknZvb";
const projectSecret = "2274a79139ff6fdb2f016d12f713dca1";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export default function CreateProfile() {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [formInput, updateFormInput] = useState({
    altName: "",
    role: "",
    coverImage: "",
  });
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressListed, setAddressListed] = useState(false);

  useEffect(() => {
    checkListed();
  }, []);

  async function onChange(e: any) {
    // upload image to IPFS

    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog: any) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.io/ipfs/${added.path}`;
      console.log(url);

      // @ts-ignore
      setFileUrl(url);
      updateFormInput({
        ...formInput,
        coverImage: url,
      });
      setProfileImage(file);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function uploadToIPFS() {
    const { altName, role, coverImage } = formInput;
    if (!coverImage || !role || !altName) {
      return;
    } else {
      // first, upload metadata to IPFS
      const data = JSON.stringify({
        altName,
        role,
        coverImage,
      });
      try {
        const added = await client.add(data);
        const url = `https://ipfs.io/ipfs/${added.path}`;
        // after metadata is uploaded to IPFS, return the URL to use it in the transaction

        return url;
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }
  }

  async function listNFTForSale() {
    try {
      setLoading(true);
      toast({
        title: "Please confirm both transactions in your wallet",
        description: "This may take a few seconds",
      });

      // @ts-ignore
      const web3 = new Web3(window.ethereum);
      const url = await uploadToIPFS();

      const networkId = await web3.eth.net.getId();

      // Mint the NFT
      // @ts-ignore
      const NFTContractAddress = NFT.networks[networkId].address;
      // @ts-ignore
      const NFTContract = new web3.eth.Contract(NFT.abi, NFTContractAddress);
      const accounts = await web3.eth.getAccounts();

      const commendContract = new web3.eth.Contract(
        // @ts-ignore
        Commend.abi,
        // @ts-ignore
        Commend.networks[networkId].address
      );

      NFTContract.methods
        .mint(url)
        .send({ from: accounts[0] })
        .on("receipt", function (receipt: any) {
          console.log("minted");
          // List the NFT
          const tokenId = receipt.events.NFTMinted.returnValues[0];
          commendContract.methods
            .listNft(NFTContractAddress, tokenId)
            .send({ from: accounts[0] })
            .on("receipt", function () {
              console.log("listed");
              toast({
                title: "Successfully created profile!",
                description:
                  "Your profile is now live, find it in the Commend page.",
              });

              setLoading(false);
            });
        });
    } catch (error) {
      console.log(error);
    }
  }

  async function checkListed() {
    try {
      // @ts-ignore
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();

      const commendContract = new web3.eth.Contract(
        // @ts-ignore
        Commend.abi,
        // @ts-ignore
        Commend.networks[networkId].address
      );

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0]; // use the first account in the array

      const listed = await commendContract.methods.hasListedNft(account).call();

      console.log(listed);
      setAddressListed(listed);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="bg-black h-screen">
      {addressListed ? (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-md bg-[#111] p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon
                className="h-5 w-5 text-indigo-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-white">
                You already have a profile! Consider commending someone or
                generating a{" "}
                <Link className="underline" href="/receive-commend">
                  receive page
                </Link>
                .
              </p>
              <p className="mt-3 text-sm md:mt-0 md:ml-6">
                <Link
                  href="/commend"
                  className="whitespace-nowrap font-medium text-white hover:underline"
                >
                  Commend someone
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
      <div className="space-y-6">
        <div className="bg-black px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-base font-semibold leading-6 text-white">
                Create a 0xCommend Profile!
              </h3>
              <p className="mt-1 text-sm text-[#999]">
                Make sure you connect your wallet first. As of now, you cannot
                make edits later, be sure to upload the correct info! It takes
                less than 1 minute to create a profile.
              </p>
            </div>
            <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <label
                    htmlFor="company-website"
                    className="block text-sm font-medium leading-6 text-white"
                  >
                    Alternative Name (ENS, Twitter, etc.)
                  </label>
                  <div className="mt-2 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="company-website"
                      id="company-website"
                      className="block w-full flex-1 rounded-md border-0 py-1.5 text-white bg-black ring-1 ring-inset ring-zinc-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="ex. abd0x.eth"
                      autoComplete="off"
                      onChange={(e) =>
                        updateFormInput({
                          ...formInput,
                          altName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-white">
                  Profile Photo
                </label>
                <div className="mt-2 flex items-center space-x-5">
                  <span className="inline-block h-12 w-12 overflow-hidden rounded-md bg-[#111]">
                    {fileUrl ? (
                      <img
                        className="h-full w-full text-gray-300"
                        src={fileUrl}
                        alt="Profile"
                      />
                    ) : (
                      <svg
                        className="h-full w-full text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="file"
                    onChange={onChange}
                    className="text-sm text-grey-500
            file:mr-5 file:py-2 file:px-6
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-[#333] file:text-white
            hover:file:cursor-pointer hover:file:bg-bg-gray-100/80
            hover:file:text-white/80
          "
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-white">
                    Role
                  </label>
                  <Select
                    onValueChange={(value) =>
                      updateFormInput({ ...formInput, role: value })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                        <SelectItem value="Marketer">Marketer</SelectItem>
                        <SelectItem value="Project Manager">
                          Project Manager
                        </SelectItem>
                        <SelectItem value="Business Analyst">
                          Business Analyst
                        </SelectItem>
                        <SelectItem value="Product Designer">
                          Product Designer
                        </SelectItem>
                        <SelectItem value="Influencer">Influencer</SelectItem>
                        <SelectItem value="Community Manager">
                          Community Manager
                        </SelectItem>
                        <SelectItem value="Content Creator">
                          Content Creator
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {loading ? (
                <button
                  disabled
                  type="submit"
                  className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Creating profile&nbsp;
                  <ArrowsPointingInIcon className="animate-spin h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={listNFTForSale}
                  type="submit"
                  className="inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Create Commend Profile!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
