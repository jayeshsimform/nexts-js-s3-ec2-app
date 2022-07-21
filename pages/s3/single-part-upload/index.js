
import React, { useEffect, useState } from 'react';
import Head from "next/head";
import axios from 'axios';
import nProgress from 'nprogress';
import InputFile from '../../../component/InputFile';
import ImagesList from '../../../component/ImagesList';
import Message from '../../../component/Message';


export async function getServerSideProps() {
    const url = `${process.env.BASE_URL}/api/single-part/getS3Files`;
    const res = await fetch(url);
    const data = await res.json();
    return {
        props: {
            imagesUrl: data?.imagesUrl,
        },
    }
}

const CloudUpload = ({ imagesUrl }) => {
    //local state
    const [listFiles, setListFiles] = useState([]);
    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState({
        status: false,
        type: '',
        content: ''
    });

    const [selectedFile, setSelectedFile] = useState({});

    //Upload File in S3 Bucket
    const uploadFileOnS3 = async (e) => {
        if (e.target.files.length) {
            setLoader(true);
            nProgress.start();


            const file = e.target.files?.[0];
            const filename = file.name;
            const fileType = file.type;

            const currentdate = new Date();
            const time = currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
            const uploadFileName = `${time}*-*${filename}`;

            try {
                const { data } = await axios.post("/api/single-part/uploadFile", {
                    name: uploadFileName,
                    type: fileType,
                });


                const url = data.url;
                await axios.put(url, file, {
                    headers: {
                        "Content-type": file.type,
                        "Access-Control-Allow-Origin": "*",
                    },
                })
                listFiles.splice(0, 0, data?.newFile)

                //Display Message
                setMessage({
                    status: true,
                    type: 'success',
                    content: 'Image Uploaded Successfully'
                })

            }
            catch (err) {
                setMessage({
                    status: true,
                    type: 'error',
                    content: err.message
                })
            }
            finally {
                nProgress.done();
                setLoader(false)
            }
        }

    }
    //Close Snackbar
    const closeSnackbar = () => {
        setMessage({
            ...message,
            status: false,
        })
    }
    useEffect(() => {
        if (imagesUrl.length) {
            setListFiles(imagesUrl)
        }
    }, [imagesUrl]);

    return (
        <>
            <div className="container">
                <Head>
                    <title>Upload File on S3</title>
                    <meta name="description" content="Upload File in single part on S3" />
                </Head>

                <InputFile
                    loader={loader}
                    uploadFileOnS3={uploadFileOnS3}
                />

            </div>
            {/* Getting Image from S3 and render in UI */}
            <ImagesList
                listFiles={listFiles}
                loader={loader}
                setSelectedFile={setSelectedFile}
                setMessage={setMessage}
                closeSnackbar={closeSnackbar}
                selectedFile={selectedFile}
                setLoader={setLoader}
                setListFiles={setListFiles}

            />

            {/* Display message */}
            <Message message={message} closeSnackbar={closeSnackbar} />

        </>
    );
}



export default CloudUpload;