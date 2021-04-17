import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('User entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'testPass';
    user.salt = 'testSalt';
    (bcrypt.hash as jest.Mock) = jest.fn();
  });

  describe('validatePassword', () => {
    it('returns true as password is valid', async () => {
      (bcrypt.hash as jest.Mock).mockReturnValue('testPass');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('123456');
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
      expect(result).toEqual(true);
    });

    it('returns false as password is valid', async () => {
      (bcrypt.hash as jest.Mock).mockReturnValue('wrongPass');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.validatePassword('wrongPass');
      expect(bcrypt.hash).toHaveBeenCalledWith('wrongPass', 'testSalt');
      expect(result).toEqual(false);
    });
  });
});
