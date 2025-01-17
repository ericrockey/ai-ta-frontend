// ingest.ts
import { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosResponse } from 'axios'

const railway_url = 'https://web-production-f6ad.up.railway.app'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { fileName, courseName } = req.query as {
      fileName: string
      courseName: string
    }
    console.log('at ingest handler')
    const s3_filepath = `courses/${courseName}/${fileName}`

    // const local_url = 'http://127.0.0.1:8000'
    console.log('calling railway at ', railway_url + '/ingest')
    const response: AxiosResponse = await axios.get(
      railway_url + '/ingest',
      {
        params: {
          course_name: courseName,
          s3_paths: s3_filepath,
        },
      },
    )
    // const data = await
    return res.status(200).json(response.data)
    // console.log('Getting to our /ingest endpoint', data);
    // return data;
  } catch (error) {
    console.error(error)
    return []
  }
}

export default handler
