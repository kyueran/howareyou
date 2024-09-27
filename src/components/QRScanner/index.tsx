import { message, Modal } from 'antd';
import {
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
  Html5QrcodeResult,
} from 'html5-qrcode';
import React, { useEffect, useRef } from 'react';

interface QRScannerProps {
  onScanSuccess: (
    decodedText: string,
    decodedResult: Html5QrcodeResult,
  ) => void;
  onScanError?: (errorMessage: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = (props: QRScannerProps) => {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'html5qr-code-scanner';
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // Inject custom CSS
    const style = document.createElement('style');
    style.innerHTML = `
      /* Make the scanner region square */
      #html5qr-code-full-region {
        width: 100%;
        height: 0;
        padding-bottom: 100%; /* Makes the div a square */
        position: relative;
      }

      /* Hide the dashboard */
      #html5qr-code-full-region__dashboard {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Initialize the scanner
    const html5QrCode = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = html5QrCode;

    // Start scanning
    startScanning(html5QrCode);

    // Cleanup on unmount
    return () => {
      stopScanning(html5QrCode);
      document.head.removeChild(style);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = async (html5QrCode: Html5Qrcode) => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log('devices', devices);

      if (devices && devices.length) {
        // Attempt to find the back-facing camera
        const backCameras = devices.filter((device) =>
          device.label.toLowerCase().includes('back'),
        );

        console.log('backCameras', backCameras);

        let cameraId = devices[0].id;
        if (backCameras.length > 0) {
          // Use the first back camera
          cameraId = backCameras[0].id;
        } else {
          /**
           * FOR ALL ERRORS, I AM DOING THIS BECAUSE FOR SOME REASON, IF YOU PASS ONSCANERROR,
           * IF IN THE EVENT ALL IS OKAY AND USER STARTS SCANNING, IF THE SCANNER DOES NOT SEE A QR CODE,
           * IT WILL TRIGGER THE ONSCANERROR FUNCTION SAYING NO QR CAN BE FOUND OR SOMETHING.
           * SO I AM JUST DISPLAYING A MESSAGE TO THE USER.
           * BECAUSE I DON'T KNOW WHERE ELSE WE WILL USE THE QR SCANNER, I AM DISPLAYING IT EVERYWHERE INSTEAD.
           */
          console.log('No back cameras found, using default camera instead.');
          messageApi.open({
            type: 'error',
            content: 'No back cameras found, using default camera instead.',
          });
          props.onScanError?.(
            'No back cameras found, using default camera instead.',
          );
          Modal.error({
            title: 'Scan Error',
            content: 'No back cameras found, using default camera instead.',
          });
        }

        const config: Html5QrcodeCameraScanConfig = { fps: 10, qrbox: 250 };

        await html5QrCode.start(
          cameraId,
          config,
          props.onScanSuccess,
          props.onScanError,
        );
      } else {
        console.log('No cameras found');
        messageApi.open({
          type: 'error',
          content: 'No cameras found',
        });
        props.onScanError?.('No cameras found');
        Modal.error({
          title: 'Scan Error',
          content: 'No cameras found',
        });
      }
    } catch (err: any) {
      console.log(err instanceof Error ? err.message : String(err));
      messageApi.open({
        type: 'error',
        content: err instanceof Error ? err.message : String(err),
      });
      props.onScanError?.(err instanceof Error ? err.message : String(err));
      Modal.error({
        title: 'Scan Error',
        content: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const stopScanning = async (html5QrCode: Html5Qrcode) => {
    if (html5QrCode) {
      await html5QrCode.stop();
      html5QrCode.clear();
    }
  };

  return <div id={scannerId} style={{ width: '100%' }} />;
};

export default QRScanner;
