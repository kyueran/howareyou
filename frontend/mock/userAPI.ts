const users = [
  { id: 0, name: 'Umi', nickName: 'U', gender: 'MALE' },
  { id: 1, name: 'Fish', nickName: 'B', gender: 'FEMALE' },
];

export default {
  'POST /api/login': async (req: any, res: any) => {
    const { username, password } = req.body;
    await new Promise((res) => setTimeout(res, 1000));
    if (username === 'volunteer' && password === 'pword') {
      return res.send({
        status: 'ok',
        data: {
          id: 1,
          role: 'volunteer',
          name: 'volname',
          token: 'mock-token-volunteer',
        },
      });
    }
    if (username === 'resident' && password === 'pword') {
      return res.send({
        status: 'ok',
        data: {
          id: 2,
          role: 'resident',
          name: 'resname',
          token: 'mock-token-resident',
        },
      });
    }
    return res.send({
      status: 'error',
      message: 'Invalid username or password',
    });
  },
  'GET /api/v1/queryUserList': (req: any, res: any) => {
    res.json({
      success: true,
      data: { list: users },
      errorCode: 0,
    });
  },
  'PUT /api/v1/user/': (req: any, res: any) => {
    res.json({
      success: true,
      errorCode: 0,
    });
  },
};
