


/**
 * @param data File data, as a string
 * @param filename Name of the file
 * @param type MIME type of the file
 */
export function download(data: string, filename: string, type: string) {
    const file = new Blob([data], { type: type });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window.navigator as any).msSaveOrOpenBlob) {
        // IE10
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).msSaveOrOpenBlob(file, filename);
    } else {
        // Others
        const a = document.createElement("a");
        const url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
