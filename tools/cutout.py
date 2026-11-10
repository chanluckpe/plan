# 종목 그림: 원본에서 잘라 배경(크림색)을 투명하게 빼고 가장자리를 부드럽게 → src/tiles/*.webp (투명 배경, 고해상도)
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
A='/mnt/user-data/attachments/82c07f88-b638-5a3d-af67-0df1db666320/'
OUT='/home/claude/gc/src/tiles/'
W,H=520,455

def cut(im, name, thr=26, noside=False):
    a=np.asarray(im.convert('RGB')).astype(np.int16)
    h,w,_=a.shape
    # 바탕색: 테두리 픽셀 중앙값
    border=np.concatenate([a[0],a[-1],a[:,0],a[:,-1]])
    bg=np.median(border,axis=0)
    d=np.sqrt(((a-bg)**2).sum(-1))
    near=d<thr
    lab,n=ndimage.label(near)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bgmask=np.isin(lab,list(edge))
    # 바탕과 비슷한 옅은 그림자(발밑)는 반투명으로 남겨요
    alpha=np.where(bgmask,0.0,1.0)
    soft=(d>=thr*0.45)&bgmask&(d<thr)
    alpha[soft]=((d[soft]-thr*0.45)/(thr*0.55))*0.35
    alpha=ndimage.gaussian_filter(alpha,0.9)
    # 네모난 바닥(마루·잔디)이 생기지 않게 가장자리를 둥글게 흐리게
    yy,xx=np.mgrid[0:h,0:w]
    side=np.ones_like(xx,dtype=float) if noside else np.clip(np.minimum(xx,w-1-xx)/(w*0.035),0,1); top=np.clip(yy/(h*0.02),0,1); bot=np.clip((h-1-yy)/(h*0.03),0,1)
    # 아랫부분(바닥)은 발밑을 중심으로 타원처럼 흐려져 네모난 바닥이 사라져요
    e=((xx-w/2)/(w*0.50))**2+((yy-h*0.80)/(h*0.36))**2
    t=np.clip((yy-h*0.55)/(h*0.25),0,1); t=t*t*(3-2*t)
    floor=1-t*(1-np.clip((1.3-e)/0.55,0,1))
    if noside: floor=np.ones_like(floor)
    fade=side*top*bot*floor; fade=fade*fade*(3-2*fade)
    alpha=np.clip(alpha*fade,0,1)
    rgba=np.dstack([a.astype(np.uint8),(alpha*255).astype(np.uint8)])
    img=Image.fromarray(rgba,'RGBA')
    bb=img.getchannel('A').point(lambda v:255 if v>24 else 0).getbbox()
    img=img.crop(bb)
    # 꼭 맞게 잘라 저장 (긴 변 520px)
    pad=int(max(img.size)*0.025)
    can=Image.new('RGBA',(img.width+2*pad,img.height+2*pad),(0,0,0,0)); can.paste(img,(pad,pad),img)
    s=520/max(can.size)
    can=can.resize((int(can.width*s),int(can.height*s)),Image.LANCZOS)
    if s>1.05: can=can.filter(ImageFilter.UnsharpMask(radius=1.2,percent=60,threshold=2))
    can.save(OUT+name+'.webp',quality=80,method=6)
    return can

sheet=Image.open(A+'7d253f87-image.png').convert('RGB')
cw,ch=sheet.width/5,sheet.height/2
names=[['soccer','basketball','volleyball','teeball','ultimate'],['flag','handball','soccer2','futsal','dodgeball']]
for r in range(2):
    for c in range(5):
        x0,y0=c*cw,r*ch
        cut(sheet.crop((int(x0+10),int(y0+10),int(x0+cw-10),int(y0+ch*0.835))),names[r][c])
q=Image.open(A+'2f8fc934-image.png').convert('RGB'); qw=q.width/2; qh=q.height/2
from PIL import ImageDraw
def kinball(im):
    a=np.asarray(im).astype(int); R,G,B=a[...,0],a[...,1],a[...,2]
    pink=(R>200)&(G<150)&(B>120)
    ys,xs=np.nonzero(pink); top,bot,left=ys.min(),ys.max(),xs.min(); r=(bot-top)/2; cy=(top+bot)/2; cx=left+r
    extra=int(max(0,cx+r+8-im.width))
    big=Image.new('RGB',(im.width+extra,im.height),tuple(int(v) for v in np.median(np.concatenate([a[0],a[-1]]),axis=0)))
    d=ImageDraw.Draw(big); col=tuple(int(v) for v in a[pink].mean(0))
    d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=col,outline=(30,20,30),width=5)
    # 원래 그림 위에 겹치되, 잘린 경계 바로 앞까지만
    big.paste(im.crop((0,0,im.width-3,im.height)),(0,0))
    return big
for (r,c,n) in [(0,0,'floorball'),(0,1,'kinball'),(1,0,'lacrosse'),(1,1,'rugby')]:
    x0,y0=c*qw,r*qh
    cr=q.crop((int(x0+12),int(y0+12),int(x0+qw-12),int(y0+qh*0.80)))
    if n=='kinball': cut(kinball(q.crop((int(x0+12),int(y0+12),int(x0+qw),int(y0+qh*0.80)))),n,noside=True)
    else: cut(cr,n)
nb=Image.open(A+'b008fefc-image.png').convert('RGB'); cut(nb.crop((14,14,nb.width-14,int(nb.height*0.84))),'netball')
rk=Image.open(A+'3c28601f-image.png').convert('RGB'); cut(rk.crop((14,14,rk.width-14,1030)),'racket')
ck=Image.open(A+'8f498e1b-image.png').convert('RGB'); cut(ck.crop((14,14,ck.width-14,1020)),'chukball')
print('done')
