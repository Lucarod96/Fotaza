import { Router } from "express"

const router = Router()

router.get('/nueva', (req, res) => {
  res.render('nuevaPublicacion');
});

export default router;