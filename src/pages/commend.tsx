import { Fragment, useState, useRef, useEffect } from "react";
import Web3 from "web3";
import Commend from "@/backend/build/contracts/Commend.json";
import NFT from "@/backend/build/contracts/NFT.json";
import { useAddress } from "@thirdweb-dev/react";
import axios from "axios";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Bars3BottomLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, EnvelopeIcon } from "@heroicons/react/20/solid";

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  { name: "Team", href: "#", icon: UsersIcon, current: false },
  { name: "Projects", href: "#", icon: FolderIcon, current: false },
  { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
  { name: "Documents", href: "#", icon: InboxIcon, current: false },
  { name: "Reports", href: "#", icon: ChartBarIcon, current: false },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const address = useAddress();
  const { toast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [commendCount, setCommendCount] = useState(0);
  const [commendDescription, setCommendDescription] = useState("");
  const [commendAddress, setCommendAddress] = useState("");
  const [query, setQuery] = useState("");
  const [roleQuery, setRoleQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedNFTCommends, setSelectedNFTCommends] = useState(null);
  const [isValid, setIsValid] = useState(false);

  const cancelButtonRef = useRef(null);
  const filteredItems =
    query === ""
      ? nfts
      : nfts.filter(
          (item) =>
            // @ts-ignore
            item.altName.toLowerCase().includes(query.toLowerCase()) ||
            // @ts-ignore
            item.role.toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey && event.key === "k") {
        // @ts-ignore
        document.getElementById("search").focus();
        event.preventDefault();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function loadSongs() {
    console.log("Loading songs...");
    // @ts-ignore
    const web3 = new Web3(window.ethereum);

    const networkId = await web3.eth.net.getId();

    // Get all listed NFTs
    const radioContract = new web3.eth.Contract(
      // @ts-ignore
      Commend.abi,
      // @ts-ignore
      Commend.networks[networkId].address
    );
    const listings = await radioContract.methods.getListedNfts().call();
    // Iterate over the listed NFTs and retrieve their metadata
    const nfts = await Promise.all(
      listings.map(async (i: any) => {
        try {
          const NFTContract = new web3.eth.Contract(
            // @ts-ignore
            NFT.abi,
            // @ts-ignore
            NFT.networks[networkId].address
          );
          const tokenURI = await NFTContract.methods.tokenURI(i.tokenId).call();
          const meta = await axios.get(tokenURI);
          const descriptions = i.descriptions;
          const commendationAddresses = i.addressCommender;
          const commendations = i.commendations; // Retrieve the commendations array from the smart contract

          const nft = {
            tokenId: i.tokenId,
            seller: i.seller,
            owner: i.buyer,
            role: meta.data.role,
            altName: meta.data.altName,
            coverImage: meta.data.coverImage,
            commendCount: i.commendCount,
            description: descriptions,
            commendAddress: commendationAddresses,
            commendations: commendations, // Include the commendations array in the metadata for the NFT
          };
          return nft;
        } catch (err) {
          console.log(err);
          return null;
        }
      })
    );
    // setNfts(nfts.filter((nft) => nft !== null));

    // set nfts in order of heatCount
    const sortedNfts = nfts
      .filter((nft) => nft !== null)
      .sort((a, b) => b.commendCount - a.commendCount);
    const topThreeNfts = sortedNfts.slice(0, 5);

    // @ts-ignore
    setNfts(sortedNfts);
  }

  async function handleGiveHeat(nfts: any) {
    // Get an instance of the Radio contract

    try {
      toast({
        title: "Please confirm the transaction in your wallet.",
        description: "You will be charged 0.001 ETH for this transaction.",
      });
      setLoading(true);
      // @ts-ignore
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const radioContract = new web3.eth.Contract(
        // @ts-ignore
        Commend.abi,
        // @ts-ignore
        Commend.networks[networkId].address
      );

      radioContract.methods
        .giveCommend(nfts.tokenId, 1, commendDescription, commendAddress)
        .send({
          // @ts-ignore
          from: window.ethereum.selectedAddress,

          value: web3.utils.toWei("0.001", "ether"),
        })
        .on("receipt", function () {
          console.log("listed");
          toast({
            title: "Successfully commended!",
            description: "Thanks for helping the community!",
          });
          setLoading(false);
        });
    } catch (err) {
      console.log(err);
    }
  }

  function setQueryBySelect(select: any) {
    setQuery(select);
  }

  function handleInput(event: any) {
    if (event.target === address) {
      // only validate if name is "walletAddress"
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                      alt="Your Company"
                    />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-4 h-6 w-6 flex-shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      ))}
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}

        <div className="flex flex-1 flex-col">
          {/* <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div> */}

          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between mt-2 mb-2">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="search"
                      id="search"
                      placeholder="Search for user"
                      onChange={(e) => setQuery(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                      <kbd className="inline-flex items-center rounded border border-gray-200 px-1 font-sans text-xs text-gray-400">
                        ⌘K
                      </kbd>
                    </div>
                  </div>
                  <Select onValueChange={setQueryBySelect}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value="">All</SelectItem>
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

                {query && (
                  <div className="mb-2">
                    <span className="inline-flex items-center rounded-md bg-indigo-100 py-0.5 pl-2.5 pr-1 text-sm font-medium text-indigo-700">
                      {query}
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                      >
                        <span className="sr-only">Remove large option</span>
                        <svg
                          className="h-2 w-2"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 8 8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeWidth="1.5"
                            d="M1 1l6 6m0-6L1 7"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>
                )}

                <div className="relative">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div className="w-full border-t border-gray-300" />
                  </div>
                </div>
              </div>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
                {/* Your content */}
                <div className="overflow-hidden bg-white shadow sm:rounded-md ">
                  <ul role="list" className="divide-y divide-gray-200 ">
                    {/* {applications.map((application) => ( */}

                    {filteredItems.length
                      ? filteredItems.map((nft, index) => (
                          <motion.li
                            key={index}
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.1, delay: index * 0.1 }}
                          >
                            <div className="block hover:bg-gray-50 transition-all duration-500">
                              <div className="flex items-center px-4 py-4 sm:px-6">
                                <div className="flex min-w-0 flex-1 items-center">
                                  <div className="flex-shrink-0">
                                    <img
                                      className="h-12 w-12 rounded-md"
                                      //   @ts-ignore
                                      src={nft.coverImage}
                                      alt=""
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                    <div>
                                      <p className="truncate text-sm font-medium text-indigo-600">
                                        {/* @ts-ignore */}
                                        {nft.altName}
                                      </p>
                                      <p className="mt-2 flex items-center text-sm text-gray-500">
                                        <EnvelopeIcon
                                          className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                          aria-hidden="true"
                                        />
                                        <span className="truncate">
                                          {/* @ts-ignore */}
                                          {nft.seller}
                                        </span>
                                      </p>
                                    </div>
                                    <div className="hidden lg:block">
                                      <span
                                        onClick={() => {
                                          // @ts-ignore
                                          setQuery(nft.role);
                                        }}
                                        className="cursor-pointer inline-flex items-center rounded-md bg-gray-100 hover:bg-gray-200 transition-all duration-400 px-2.5 py-0.5 text-sm font-medium text-gray-800"
                                      >
                                        {/* @ts-ignore */}
                                        {nft.role}
                                      </span>
                                      <p className="mt-2 flex items-center text-sm text-gray-500">
                                        <CheckCircleIcon
                                          className="mr-1.5 h-5 w-5 flex-shrink-0 text-indigo-400"
                                          aria-hidden="true"
                                        />
                                        Verified Profile
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  {/* <ChevronRightIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              /> */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedNFTCommends(nft);
                                    }}
                                    className="rounded-md bg-indigo-50 py-2.5 px-3.5 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 transition-all duration-400"
                                  >
                                    {/* @ts-ignore */}
                                    {nft.commendCount} Reviews
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedNFT(nft);
                                    }}
                                    className="rounded-md bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                  >
                                    Commend
                                  </button>

                                  {/* Give Commend Slide Over */}
                                  <Transition.Root
                                    show={selectedNFT === nft}
                                    as={Fragment}
                                  >
                                    <Dialog
                                      as="div"
                                      className="relative z-50"
                                      onClose={setSlideOverOpen}
                                    >
                                      <div className="fixed inset-0" />

                                      <div className="fixed inset-0 overflow-hidden">
                                        <div className="absolute inset-0 overflow-hidden">
                                          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                                            <Transition.Child
                                              as={Fragment}
                                              enter="transform transition ease-in-out duration-500 sm:duration-700"
                                              enterFrom="translate-x-full"
                                              enterTo="translate-x-0"
                                              leave="transform transition ease-in-out duration-500 sm:duration-700"
                                              leaveFrom="translate-x-0"
                                              leaveTo="translate-x-full"
                                            >
                                              <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                                <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                                                  <div className="h-0 flex-1 overflow-y-auto">
                                                    <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                                                      <div className="flex items-center justify-between">
                                                        <Dialog.Title className="text-base font-semibold leading-6 text-white">
                                                          Give commend to{" "}
                                                          {/* @ts-ignore */}
                                                          {nft.altName}
                                                        </Dialog.Title>
                                                        <div className="ml-3 flex h-7 items-center">
                                                          <button
                                                            type="button"
                                                            className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                                            onClick={() =>
                                                              setSelectedNFT(
                                                                null
                                                              )
                                                            }
                                                          >
                                                            <span className="sr-only">
                                                              Close panel
                                                            </span>
                                                            <XMarkIcon
                                                              className="h-6 w-6"
                                                              aria-hidden="true"
                                                            />
                                                          </button>
                                                        </div>
                                                      </div>
                                                      <div className="mt-1">
                                                        <p className="text-sm text-indigo-300">
                                                          Get started by filling
                                                          in the information
                                                          below to create your
                                                          new project.
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-between">
                                                      <div className="divide-y divide-gray-200 px-4 sm:px-6">
                                                        <div className="space-y-6 pt-6 pb-5">
                                                          <div>
                                                            <label
                                                              htmlFor="project-name"
                                                              className="block text-sm font-medium leading-6 text-gray-900"
                                                            >
                                                              Confirm your
                                                              Wallet Address
                                                            </label>
                                                            <div className="mt-2">
                                                              <input
                                                                type="text"
                                                                name="project-name"
                                                                id="project-name"
                                                                autoComplete="off"
                                                                placeholder="0x..."
                                                                onInput={
                                                                  handleInput
                                                                }
                                                                pattern={
                                                                  address
                                                                }
                                                                required
                                                                // className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                className="valid:[&:not(:placeholder-shown)]:border-green-500 [&:not(:placeholder-shown):not(:focus):invalid~span]:block invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-400 block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                onChange={(
                                                                  e
                                                                ) => {
                                                                  setCommendAddress(
                                                                    e.target
                                                                      .value
                                                                  );
                                                                  handleInput(
                                                                    e
                                                                  );
                                                                }}
                                                              />
                                                              {isValid ? (
                                                                <span className="mt-2 text-sm text-green-500">
                                                                  You have been
                                                                  correctly
                                                                  identified as
                                                                  the owner of
                                                                  this wallet.
                                                                </span>
                                                              ) : (
                                                                <span className="mt-2 hidden text-sm text-red-400">
                                                                  Please enter
                                                                  your wallet
                                                                  address. (you
                                                                  should be
                                                                  connected to
                                                                  this wallet){" "}
                                                                </span>
                                                              )}
                                                            </div>
                                                          </div>
                                                          <div>
                                                            <label
                                                              htmlFor="description"
                                                              className="block text-sm font-medium leading-6 text-gray-900"
                                                            >
                                                              Short Description
                                                              of your Commend
                                                            </label>
                                                            <div className="mt-2">
                                                              <textarea
                                                                rows={4}
                                                                name="comment"
                                                                id="comment"
                                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                placeholder="This should be a short description of how this person has helped you or your team."
                                                                onChange={(
                                                                  event
                                                                ) =>
                                                                  setCommendDescription(
                                                                    event.target
                                                                      .value
                                                                  )
                                                                }
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-shrink-0 justify-end px-4 py-4">
                                                    <button
                                                      type="submit"
                                                      className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                      onClick={() =>
                                                        handleGiveHeat(nft)
                                                      }
                                                    >
                                                      Give Commend
                                                    </button>
                                                  </div>
                                                </div>
                                              </Dialog.Panel>
                                            </Transition.Child>
                                          </div>
                                        </div>
                                      </div>
                                    </Dialog>
                                  </Transition.Root>

                                  {/* Reviews SlideOver */}
                                  <Transition.Root
                                    show={selectedNFTCommends === nft}
                                    as={Fragment}
                                  >
                                    <Dialog
                                      as="div"
                                      className="relative z-10"
                                      //   @ts-ignore
                                      onClose={setSelectedNFTCommends}
                                    >
                                      <div className="fixed inset-0" />

                                      <div className="fixed inset-0 overflow-hidden">
                                        <div className="absolute inset-0 overflow-hidden">
                                          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                                            <Transition.Child
                                              as={Fragment}
                                              enter="transform transition ease-in-out duration-500 sm:duration-700"
                                              enterFrom="translate-x-full"
                                              enterTo="translate-x-0"
                                              leave="transform transition ease-in-out duration-500 sm:duration-700"
                                              leaveFrom="translate-x-0"
                                              leaveTo="translate-x-full"
                                            >
                                              <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                                  <div className="px-4 py-6 sm:px-6">
                                                    <div className="flex items-start justify-between">
                                                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                                                        Profile
                                                      </Dialog.Title>
                                                      <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                          type="button"
                                                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                                                          onClick={() =>
                                                            setSelectedNFTCommends(
                                                              null
                                                            )
                                                          }
                                                        >
                                                          <span className="sr-only">
                                                            Close panel
                                                          </span>
                                                          <XMarkIcon
                                                            className="h-6 w-6"
                                                            aria-hidden="true"
                                                          />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  {/* Main */}
                                                  <div className="divide-y divide-gray-200">
                                                    <div className="pb-6 sticky top-0 bg-white">
                                                      <div className="h-24 bg-indigo-700 sm:h-20 lg:h-28" />
                                                      <div className="lg:-mt-15 -mt-12  px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 ">
                                                        <div>
                                                          <div className="-m-1 flex">
                                                            <div className="inline-flex overflow-hidden rounded-lg border-4 border-white">
                                                              <img
                                                                className="h-24 w-24 flex-shrink-0 sm:h-40 sm:w-40 lg:h-48 lg:w-48"
                                                                src={
                                                                  //   @ts-ignore
                                                                  nft.coverImage
                                                                }
                                                                alt=""
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div className="mt-6 sm:ml-6 sm:flex-1">
                                                          <div>
                                                            <div className="flex items-center">
                                                              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                                                {/* @ts-ignore */}
                                                                {nft.altName}
                                                                &apos;s Commends
                                                              </h3>
                                                              <span className="ml-2.5 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-green-400">
                                                                <span className="sr-only">
                                                                  Online
                                                                </span>
                                                              </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                              {/* @ts-ignore */}
                                                              {nft.seller}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    {/* @ts-ignore */}
                                                    {nft.description.map(
                                                      (
                                                        desc: any,
                                                        index: any
                                                      ) => (
                                                        <Fragment key={index}>
                                                          <div className="px-4 py-5 sm:px-0 sm:py-0 hover:bg-gray-100 transition-all duration-400">
                                                            <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                                                              <div className="sm:flex sm:px-6 sm:py-5">
                                                                <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                                                  From:{" "}
                                                                  {/* @ts-ignore */}
                                                                  {nft.commendAddress[
                                                                    index
                                                                  ].slice(
                                                                    0,
                                                                    5
                                                                  ) +
                                                                    "..." +
                                                                    // @ts-ignore
                                                                    nft.commendAddress[
                                                                      index
                                                                    ].slice(-4)}
                                                                </dt>
                                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 sm:ml-6">
                                                                  <p>{desc}</p>
                                                                </dd>
                                                              </div>
                                                            </dl>
                                                          </div>
                                                        </Fragment>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              </Dialog.Panel>
                                            </Transition.Child>
                                          </div>
                                        </div>
                                      </div>
                                    </Dialog>
                                  </Transition.Root>
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        ))
                      : [...Array(10)].map((_, index) => (
                          <li className="py-4" key={index}>
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="bg-gray-200 w-8 h-8 animate-pulse rounded-full"></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="bg-gray-200 w-full h-8 animate-pulse rounded-full"></div>
                                {/* <p className="truncate text-sm text-gray-500">{'@' + person.handle}</p> */}
                              </div>
                              <div>
                                <div className="bg-gray-200 w-20 h-8 animate-pulse rounded-full"></div>
                              </div>
                            </div>
                          </li>
                        ))}
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
