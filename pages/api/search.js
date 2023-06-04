import { getURLs } from '../../utils/metaphor.js';
import {
    browseWebPage,
    findPhoneNumbersAndEmails,
    removeDuplicates,
} from '../../utils/scraping.js';

export default async function handler(req, res) {
    const start = performance.now();

    const query = req.query.query;
    console.log(query);
    const number = req.query.number;
    console.log(number);

    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    const arrayOfPromptResults = await getURLs(query, number);
    const dataPromises = arrayOfPromptResults
        .filter((result) => result !== undefined)
        .map(async ({ urls, metaphorSearchPrompt }) => {
            return Promise.all(
                urls.map(async (url) => {
                    const text = await browseWebPage(url);
                    const { phoneNumbers, emails } =
                        await findPhoneNumbersAndEmails(text);
                    console.log('Phone Numbers: ', phoneNumbers);

                    return {
                        metaphorPrompt: metaphorSearchPrompt,
                        url: url,
                        phoneNumbers: removeDuplicates(phoneNumbers),
                        emails: removeDuplicates(emails),
                    };
                })
            );
        });

    const data = await Promise.all(dataPromises).then((res) => res.flat());
    console.log(data);

    console.log(`\nSearch took ${performance.now() - start} milliseconds.`);

    return res.json(data);
}

// export default async function handler(req, res) {
//     const query = req.query.query;
//     console.log(query);

//     if (!query) {
//         return res.status(400).json({ error: 'Missing query parameter' });
//     }

//     const data = [];
//     // const justNumbers = [];

//     const arrayOfPromptResults = await getURLs(query);
//     for (let urlsList of arrayOfPromptResults) {
//         const { urls, metaphorSearchPrompt } = urlsList;

//         for (let url of urls) {
//             const text = await browseWebPage(url);
//             const { phoneNumbers, emails } = await findPhoneNumbersAndEmails(
//                 text
//             );
//             console.log('Phone Numbers: ', phoneNumbers);

//             data.push({
//                 metaphorPrompt: metaphorSearchPrompt,
//                 url: url,
//                 // text: text,
//                 phoneNumbers: removeDuplicates(phoneNumbers),
//                 emails: removeDuplicates(emails),
//             });
//             // justNumbers.push(phoneNumbers);

//             console.log(data.phoneNumbers);
//         }
//     }

//     console.log(data);
//     // const uniquePhones = removeDuplicates(justNumbers);
//     // console.log(uniquePhones);

//     return res.json(data);
// }
