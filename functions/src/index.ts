import * as functions from 'firebase-functions';

//Firebase
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

//Cloud Vision
import * as vision from '@google-cloud/vision';
const visionClient = new vision.ImageAnnotatorClient();

// Bucket name of Firebase Storage
const bucketName = "card-reader-6448b.appspot.com";

export const imageTagger = functions.storage
        .object()
        .onFinalize(
            async event => {

                //File data
                const filePath = event.name;

                //Location of saved file in blucket
                const imageUri = `gs://${bucketName}/${filePath}`;
                console.log(imageUri);

                const docId = filePath.split('.jpg')[0];

                const docRef = admin.firestore().collection('photos').doc(docId);

                //Await the cloud vision response
                const results = await visionClient.textDetection(imageUri);

                // Map the data to desired format
                const description = results[0].textAnnotations.map(obj => obj.description);

                return docRef.set({description})

            }
        )


            