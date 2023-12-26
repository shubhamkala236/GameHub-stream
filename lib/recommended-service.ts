import { db } from "./db";
import { getSelf } from "./auth-service";

export const getRecommended = async () => {
  // await new Promise(resolve => setTimeout(resolve,5000));

  let userId;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch (error) {
    userId = null;
  }

  let users = [];

  //remove self from recommended users as logged in currently
  if (userId) {
    users = await db.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              id: userId,
            },
          },
          {
            AND: {
              followedBy: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
          {
            AND: {
              blocking: {
                some: {
                  blockedId: userId,
                },
              },
            },
          },
        ],
      },
    });

    // users = await db.user.findMany({
    //   where: {
    //     NOT: {
    //       id: userId,
    //     },
    //   },
    // });

    // await db.user.findMany({
    //   where: {
    //     NOT: {
    //       followedBy: {
    //         some: {
    //           followerId: userId,
    //         },
    //       },
    //     },
    //   },
    // });

    // await db.user.findMany({
    //   where: {
    //     NOT: {
    //       blocking: {
    //         some: {
    //           blockedId: userId,
    //         },
    //       },
    //     },
    //   },
    // });
  } else {
    //for logged out user
    users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // console.log(users);

  return users;
};
