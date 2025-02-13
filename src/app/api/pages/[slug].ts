// pages/api/pages/[slug].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import authOptions from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const session = await getServerSession(req, res, authOptions)

	if (!session || session.user.role !== 'admin') {
		return res.status(403).json({ error: 'Unauthorized' })
	}

	const { slug } = req.query

	if (req.method === 'PUT') {
		try {
			const updatedPage = await prisma.pageContent.update({
				where: { pageSlug: slug as string },
				data: req.body
			})
			res.json(updatedPage)
		} catch (error) {
			res.status(500).json({ error: 'Update failed' })
		}
	} else {
		res.setHeader('Allow', ['PUT'])
		res.status(405).end(`Method ${req.method} Not Allowed`)
	}
}
