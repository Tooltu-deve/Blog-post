/**
 * Tạo 10 bài post mẫu trong database (PostgreSQL qua Prisma).
 * Chạy từ thư mục backend: npm run seed:posts
 *
 * - Nếu chưa có user nào: tạo user seed (seed@example.com / Seed123!)
 * - Bỏ qua bài đã tồn tại (theo title) để chạy lại an toàn
 */

import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Thiếu DATABASE_URL trong môi trường (.env).');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const SEED_USER = {
  email: 'seed@example.com',
  firstName: 'Demo',
  lastName: 'Author',
  passwordPlain: 'Seed123!',
};

const SAMPLE_POSTS: Array<{
  title: string;
  content: string;
  thumbnail?: string | null;
}> = [
  {
    title: '[Sample] Giới thiệu blog',
    content:
      'Chào mừng đến với blog cá nhân. Đây là bài viết mẫu để kiểm tra giao diện và luồng đọc nội dung.\n\nChúng ta sẽ thử nghiệm đoạn văn dài hơn một chút để xem khoảng cách dòng và font chữ hiển thị ra sao trên nền parchment.',
  },
  {
    title: '[Sample] Ghi chép về AWS',
    content:
      'Khi làm việc với S3 và RDS, nhớ cấu hình security group phù hợp và không commit khóa truy cập vào git.\n\nMột số bước thường gặp: tạo VPC, subnet, rồi gắn resource vào đúng zone.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  },
  {
    title: '[Sample] NestJS và Prisma',
    content:
      'NestJS giúp tổ chức module rõ ràng; Prisma đơn giản hóa truy vấn và migration.\n\nKết hợp hai thứ này cho phép API có cấu trúc ổn định và schema database được version hóa.',
  },
  {
    title: '[Sample] Frontend React + Vite',
    content:
      'Vite mang lại thời gian khởi động dev nhanh; React Router xử lý điều hướng đa trang trong SPA.\n\nThiết kế UI có thể bám theo một design system thống nhất (màu, typography, spacing).',
  },
  {
    title: '[Sample] JWT và session',
    content:
      'JWT thường dùng cho stateless auth: server ký token, client gửi kèm header Authorization.\n\nCần chú ý thời hạn token và refresh strategy nếu ứng dụng yêu cầu phiên dài.',
  },
  {
    title: '[Sample] Docker cho backend',
    content:
      'Dockerfile multi-stage giúp image nhỏ hơn: build ở một stage, chỉ copy artifact sang runtime image.\n\nBiến môi trường DATABASE_URL nên inject lúc chạy container, không hardcode.',
  },
  {
    title: '[Sample] Viết test API',
    content:
      'E2E test với supertest có thể gọi endpoint thật trên app Nest đã bootstrap.\n\nUnit test tập trung vào service với dependency mock để phản hồi nhanh.',
  },
  {
    title: '[Sample] Quản lý comment',
    content:
      'Comment gắn với post và user: xóa post cascade comment hoặc soft-delete tùy yêu cầu nghiệp vụ.\n\nPhía UI cần hint đăng nhập trước khi gửi bình luận.',
  },
  {
    title: '[Sample] Performance cơ bản',
    content:
      'Đo thời gian phản hồi API, tránh N+1 query khi include quan hệ, và cache khi dữ liệu ít thay đổi.\n\nFrontend: lazy load route và tối ưu kích thước bundle.',
  },
  {
    title: '[Sample] Kết luận',
    content:
      'Đây là bài thứ mười trong bộ mẫu. Bạn có thể chỉnh sửa hoặc xóa các bài [Sample] sau khi đã thử nghiệm xong.\n\nChúc build vui vẻ!',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  },
];

async function ensureSeedUser() {
  const existing = await prisma.user.findUnique({
    where: { email: SEED_USER.email },
  });
  if (existing) {
    return existing;
  }

  const anyUser = await prisma.user.findFirst();
  if (anyUser) {
    console.log(`Dùng user hiện có làm tác giả: ${anyUser.email}`);
    return anyUser;
  }

  const password = await bcrypt.hash(SEED_USER.passwordPlain, 10);
  const user = await prisma.user.create({
    data: {
      email: SEED_USER.email,
      firstName: SEED_USER.firstName,
      lastName: SEED_USER.lastName,
      password,
      role: 'ADMIN',
    },
  });
  console.log(
    `Đã tạo user seed: ${user.email} (mật khẩu: ${SEED_USER.passwordPlain})`,
  );
  return user;
}

async function main() {
  const author = await ensureSeedUser();
  let created = 0;
  let skipped = 0;

  for (const post of SAMPLE_POSTS) {
    const found = await prisma.post.findFirst({
      where: { title: post.title },
    });
    if (found) {
      skipped += 1;
      continue;
    }

    const base = slugify(post.title, { lower: true, strict: true });
    const slug = `${base}-${randomUUID().slice(0, 8)}`;

    await prisma.post.create({
      data: {
        title: post.title,
        slug,
        content: post.content,
        thumbnail: post.thumbnail ?? undefined,
        status: 'PUBLISHED',
        authorId: author.id,
      },
    });
    created += 1;
  }

  console.log(
    `Xong: tạo mới ${created} bài, bỏ qua ${skipped} bài (đã tồn tại cùng title).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
