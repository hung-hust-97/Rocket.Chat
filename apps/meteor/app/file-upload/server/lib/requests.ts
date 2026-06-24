import { Uploads } from '@rocket.chat/models';
import { WebApp } from 'meteor/webapp';

import { FileUpload } from './FileUpload';

WebApp.connectHandlers.use(FileUpload.getPath(), async (req, res, next) => {
	const match = /^\/([^\/]+)\/(.*)/.exec(req.url || '');

	if (match?.[1]) {
		const file = await Uploads.findOneById(match[1]);

		res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Auth-Token, X-User-Id');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            return res.end();
        }


		if (file) {
			if (!(await FileUpload.requestCanAccessFiles(req, file))) {
				res.writeHead(403);
				return res.end();
			}

			res.setHeader('Content-Security-Policy', "default-src 'none'");
			return FileUpload.get(file, req, res, next);
		}
	}

	res.writeHead(404);
	res.end();
});
