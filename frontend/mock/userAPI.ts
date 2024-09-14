const users = [
  { id: 0, name: 'Umi', nickName: 'U', gender: 'MALE' },
  { id: 1, name: 'Fish', nickName: 'B', gender: 'FEMALE' },
];

export default {
  'POST /api/login': async (req: any, res: any) => {
    const { username, password } = req.body;
    await new Promise((res) => {
      setTimeout(res, 1000);
    });
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
  'GET /api/resident/1': async (req: any, res: any) => {
    await new Promise((res) => {
      setTimeout(res, 1000);
    });
    res.json({
      status: 'ok',
      data: {
        id: 1,
        elderlyCode: 'WL-8829',
        aacCode: 'AAC-123162',
        name: 'Goh Seok Meng',
        address: 'Woodlands Drive 62, #02-144, S623182',
        contact: 81234567,
        nok: [{ name: 'David Goh', relationship: 'Son', contact: 91234567 }],
        notes:
          'Goh Seok Meng lives alone on weekdays, can only speak Hokkien, and has difficulty walking. She does not mind having pictures taken.',
        language: ['Hokkien'],
        attachments: [],
        visits: [
          {
            datetime: '09-10-2024 20:00',
            visitor: { id: 99, name: 'David', role: 'public' },
            location: 'Home',
            attachments: [],
            notes: 'All good.'
          },
          {
            date: '09-08-2024 17:00',
            visitor: { id: 2, name: 'David Hiong', role: 'volunteer' },
            location: 'Woodlands Hawker Centre',
            attachments: [],
            notes: 'Saw auntie at Woodlands Hawker Centre, she\'s doing well'
          },
        ],
      },
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
