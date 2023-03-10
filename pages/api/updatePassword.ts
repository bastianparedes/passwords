import bcrypt from 'bcrypt';
import type { NextApiRequest, NextApiResponse } from 'next';

import constants from '../../config/constants';
import { prisma } from '../../lib/prisma';

const updatePassword = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method === 'PUT') {
    const { user, oldPassword, newPassword } = JSON.parse(req.body);
    const foundUser = await prisma.fakeUser.findUnique({ where: { user } });

    if (foundUser === null) {
      res.send({ error: constants.errors.userDoesNotExist, success: false });
      return;
    }

    const passwordIsCorrect = await bcrypt.compare(
      oldPassword,
      foundUser.password
    );

    if (!passwordIsCorrect) {
      res.send({ error: constants.errors.incorrectPassword, success: false });
      return;
    }

    const newHashedPassword = await bcrypt.hash(
      newPassword,
      constants.hashRounds
    );

    await prisma.fakeUser.update({
      data: { password: newHashedPassword },
      where: { user }
    });

    res.send({ hashedPassword: newHashedPassword, success: true });
  }
};

export default updatePassword;
