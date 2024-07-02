"use client"

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import beautify from 'js-beautify';
import { Preview } from "@/components/Preview";
import { InputField } from '@/components/InputField';
import { Switcher } from '@/components/Switcher';
import { FileUploader } from '@/components/FileUploader';
import { Button } from "@/components/Button"

import inputStyles from "@/components/InputField/styles.module.scss"

const CodeMirrorEditor = dynamic(() => import('@/components/CodeMirrorEditor'), { ssr: false });

export const HtmlEditor = () => {
    const [htmlContent, setHtmlContent] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [processedHtml, setProcessedHtml] = useState('');
    const [isProcessed, setIsProcessed] = useState(false);
    const [originalImageSrcs, setOriginalImageSrcs] = useState([]);
    const [originalHtml, setOriginalHtml] = useState('');
    const [showHtml, setShowHtml] = useState(false);
    const [linksChanged, setLinksChanged] = useState(false);
    const [showCopyPopup, setShowCopyPopup] = useState(false);
    const [isUrlHereLinks, setIsUrlHereLinks] = useState(false);
    const [fontToReplace, setFontToReplace] = useState("");
    const [fontReplaceTo, setFontReplaceTo] = useState("");
    const [isFontsChanged, setIsFontsChanged] = useState(false);

    const fileInputRef = useRef(null);

    const resetAll = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.type = "text";
            fileInputRef.current.type = "file";
        }

        setHtmlContent('');
        setLinkUrl('');
        setImageUrls([]);
        setProcessedHtml('');
        setIsProcessed(false);
        setOriginalImageSrcs([]);
        setOriginalHtml('');
        setShowHtml(false);
        setLinksChanged(false);
        setShowCopyPopup(false);
        setIsUrlHereLinks(false);
        setFontReplaceTo(false);
        setFontToReplace(false);
        setIsFontsChanged(false);
    };

    const onHtmlChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            setHtmlContent(reader.result);
            setIsProcessed(false);
            setIsUrlHereLinks(false);
            setImageUrls([]);
            setLinkUrl('');
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        setProcessedHtml(htmlContent);
    }, [htmlContent]);

    const onLinkChange = (e) => setLinkUrl(e.target.value);
    const onFontToReplaceChange = (e) => setFontToReplace(e.target.value);
    const onFontReplaceToChange = (e) => setFontReplaceTo(e.target.value);

    const changeLinks = () => {
        let updatedHtml = processedHtml.replace(/href="urlhere"/g, `href="${linkUrl}"`);
        setProcessedHtml(beautify.html(updatedHtml));
        setLinksChanged(true);
    };

    const changeFonts = () => {
        let regex = new RegExp(`${fontToReplace}`, 'g');
        let updatedHtml = processedHtml.replace(regex, `${fontReplaceTo}`);
        setProcessedHtml(beautify.html(updatedHtml));
        setIsFontsChanged(true);
    };

    const revertToOriginalFonts = () => {
        let regex = new RegExp(`${fontReplaceTo}`, 'g');
        let updatedHtml = processedHtml.replace(regex, `${fontToReplace}`);
        setProcessedHtml(beautify.html(updatedHtml));
        setIsFontsChanged(false);
    }
    

    const onProcessHtml = () => {
        setOriginalHtml(htmlContent);
        const imgTags = Array.from(new DOMParser().parseFromString(htmlContent, 'text/html').querySelectorAll('img'));
        const urls = imgTags.map((img) => img.src);
        setImageUrls(urls);

        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        const urlHereLinks = doc.querySelectorAll('a');
        if (urlHereLinks.length) {
            setIsUrlHereLinks(true);
        }

        const originalSrcs = imgTags.map((img, index) => ({ index, src: img.src }));
        setOriginalImageSrcs(originalSrcs);
        setIsProcessed(true);
    };

    const revertToOriginalLinks = () => {
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const escapedLinkUrl = escapeRegExp(linkUrl);

        const regex = new RegExp(`href="${escapedLinkUrl}"`, 'g');

        const currentHtml = processedHtml;
        const revertedHtml = currentHtml.replace(regex, 'href="urlhere"');

        setProcessedHtml(beautify.html(revertedHtml));
        setLinksChanged(false);
    };

    const updateImageSrc = (index, url) => {
        const doc = new DOMParser().parseFromString(processedHtml, 'text/html');
        doc.querySelectorAll('img')[index].src = url;
        setImageUrls(arr => {
            arr[index] = url;
            return arr;
        })
        setProcessedHtml(beautify.html(doc.documentElement.innerHTML));
    };

    const restoreOriginalSrc = (index) => {
        if (originalImageSrcs[index]) {
            updateImageSrc(index, originalImageSrcs[index].src);
        }
    };

    const toggleShowHtml = () => {
        setShowHtml(!showHtml);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(processedHtml)
            .then(() => {
                setShowCopyPopup(true); // Show copy confirmation popup
                setTimeout(() => setShowCopyPopup(false), 1500); // Hide popup after 1.5 seconds
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
            });
    };

    const downloadHtmlFile = () => {
        const element = document.createElement('a');
        const file = new Blob([processedHtml], { type: 'text/html' });
        element.href = URL.createObjectURL(file);
        element.download = 'processed.html';
        document.body.appendChild(element); // Required for Firefox
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div style={{ margin: '20px' }}>
            <FileUploader onHtmlChange={onHtmlChange} innerRef={fileInputRef} />
            <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
                <span style={{ marginRight: "10px" }}>Show HTML</span>
                <Switcher showHtml={showHtml} toggleShowHtml={toggleShowHtml} />
                <Button onClick={onProcessHtml} disabled={isProcessed || !htmlContent}>Parse HTML</Button>
                <Button onClick={copyToClipboard} disabled={!htmlContent}>Copy</Button>
                <Button onClick={downloadHtmlFile} disabled={!htmlContent}>Download</Button>
                <Button onClick={resetAll} disabled={!htmlContent}>Delete</Button>
            </div>

            {showHtml && (
                <CodeMirrorEditor
                    value={processedHtml}
                    onChange={setHtmlContent}
                />
            )}

            <div style={{ display: "flex" }}>
                <div style={{ flex: "0 0 auto", marginRight: "20px" }}>
                    {isUrlHereLinks && processedHtml && (
                        <>
                            <div style={{ margin: "10px 0", display: "flex" }}>
                                <div className={inputStyles.textInputWrapper}>
                                    <input
                                        className={inputStyles.textInput}
                                        type="text"
                                        placeholder="Enter link URL"
                                        value={linkUrl}
                                        onChange={onLinkChange}
                                    />
                                </div>
                                <Button onClick={changeLinks} disabled={!linkUrl || linksChanged}>
                                    Change
                                </Button>
                                <Button
                                    onClick={revertToOriginalLinks}
                                    disabled={!linkUrl || !linksChanged}
                                >
                                    Return
                                </Button>
                            </div>
                            <div style={{ margin: "10px 0", display: "flex" }}>
                                <div className={inputStyles.textInputWrapper} style={{ display: "flex", rowGap: "10px", flexDirection: "column" }}>
                                    <input
                                        className={inputStyles.textInput}
                                        type="text"
                                        placeholder="Font to replace"
                                        value={fontToReplace}
                                        onChange={onFontToReplaceChange}
                                    />
                                    <input
                                        className={inputStyles.textInput}
                                        type="text"
                                        placeholder="Replace font to"
                                        value={fontReplaceTo}
                                        onChange={onFontReplaceToChange}
                                    />
                                </div>
                                <Button onClick={changeFonts} disabled={!fontToReplace || !fontReplaceTo || isFontsChanged}>
                                    Change
                                </Button>
                                <Button
                                    onClick={revertToOriginalFonts}
                                    disabled={!fontToReplace || !fontReplaceTo || !isFontsChanged}
                                >
                                    Return
                                </Button>
                            </div>
                        </>
                    )}

                    {!!imageUrls.length && processedHtml &&
                        imageUrls.map((url, index) => (
                            <div key={index}>
                                <InputField
                                    index={index}
                                    updateImageSrc={updateImageSrc}
                                    restoreOriginalSrc={restoreOriginalSrc}
                                    originalImageSrcs={originalImageSrcs}
                                    imageUrls={imageUrls}
                                />
                            </div>
                        ))}
                </div>

                {isProcessed && <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
                    <Preview html={processedHtml} />
                </div>}
            </div>

            {showCopyPopup && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#313033',
                    color: "white",
                    border: '1px solid #cccccc',
                    padding: '10px 20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 9999
                }}>
                    HTML Copied to Clipboard
                </div>
            )}
        </div>
    );
};
