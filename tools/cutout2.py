# 새 캐릭터 시트(4×4): 칸마다 잘라 글자 지우고 배경 빼서 src/tiles/*.webp
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
SRC='/mnt/user-data/attachments/82c07f88-b638-5a3d-af67-0df1db666320/1dad8ef6-image.png'
OUT='/home/claude/gc/src/tiles/'
XS=[(18,264),(293,547),(565,809),(825,1091)]; YS=[(8,238),(254,483),(498,728),(740,960)]
NAMES=[['flag','basketball','volleyball','teeball'],['soccer','ultimate','dodgeball','netball'],['futsal','handball','floorball','kinball'],['lacrosse','rugby','chukball','racket']]
sheet=np.asarray(Image.open(SRC).convert('RGB')).astype(np.int16)
LABEL_RIGHT={'handball':66,'lacrosse':80,'chukball':66,'racket':95}
def unlabel(a,name=''):
    h,w,_=a.shape; L=a.mean(-1)
    dark=L<95
    lab,n=ndimage.label(dark,structure=np.ones((3,3)))
    bg=np.median(np.concatenate([a[-1],a[:,-1]]),axis=0)
    kill=np.zeros((h,w),bool)
    for i,sl in enumerate(ndimage.find_objects(lab),1):
        y0,y1=sl[0].start,sl[0].stop; x0,x1=sl[1].start,sl[1].stop
        if y1<h*0.2 and x0<w*0.75 and (y1-y0)<h*0.16: kill|=lab==i
    if name in LABEL_RIGHT and kill.any():
        yb=np.nonzero(kill)[0].max()+2; xr=LABEL_RIGHT[name]
        sub=a[:yb,:xr]; mx=sub.max(-1); mn=sub.min(-1); brown=(sub[...,0]-sub[...,2])>28
        kill[:yb,:xr]|=((mx-mn)<40)&(sub.mean(-1)<200)&~brown
    kill=ndimage.binary_dilation(kill,iterations=3)
    # 글자 둘레의 옅은 회색 번짐까지 같이 지워요 (바탕과 다른 픽셀 중 글자 근처)
    a=a.copy(); a[kill]=bg
    return a,kill.sum()
def cut(a,name,thr=24):
    h,w,_=a.shape
    border=np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]); bg=np.median(border,axis=0)
    d=np.sqrt(((a-bg)**2).sum(-1)); near=d<thr
    lab,n=ndimage.label(near)
    edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    bgm=np.isin(lab,list(edge))
    alpha=np.where(bgm,0.0,1.0)
    soft=(d>=thr*0.45)&bgm&(d<thr); alpha[soft]=((d[soft]-thr*0.45)/(thr*0.55))*0.35
    alpha=ndimage.gaussian_filter(alpha,0.8)
    yy,xx=np.mgrid[0:h,0:w]
    side=np.clip(np.minimum(xx,w-1-xx)/(w*0.03),0,1); top=np.clip(yy/(h*0.02),0,1); bot=np.clip((h-1-yy)/(h*0.03),0,1)
    fade=side*top*bot; alpha=np.clip(alpha*fade,0,1)
    # 글자 조각처럼 위쪽에 떨어져 있는 작은 덩어리는 지워요
    lab2,n2=ndimage.label(alpha>0.3)
    if n2:
        sizes=ndimage.sum(np.ones_like(alpha),lab2,range(1,n2+1)); big=sizes.max()
        for i,sl in enumerate(ndimage.find_objects(lab2),1):
            if sl[0].stop<h*0.26 and sizes[i-1]<big*0.03:
                m=ndimage.binary_dilation(lab2==i,iterations=2); alpha[m]=0
    img=Image.fromarray(np.dstack([a.astype(np.uint8),(alpha*255).astype(np.uint8)]),'RGBA')
    bb=img.getchannel('A').point(lambda v:255 if v>24 else 0).getbbox(); img=img.crop(bb)
    pad=int(max(img.size)*0.025)
    can=Image.new('RGBA',(img.width+2*pad,img.height+2*pad),(0,0,0,0)); can.paste(img,(pad,pad),img)
    s=520/max(can.size); can=can.resize((int(can.width*s),int(can.height*s)),Image.LANCZOS)
    can=can.filter(ImageFilter.UnsharpMask(radius=1.4,percent=80,threshold=2))
    can.save(OUT+name+'.webp',quality=82,method=6); return can
for r,(y0,y1) in enumerate(YS):
    for c,(x0,x1) in enumerate(XS):
        a=sheet[y0+5:y1-4,x0+5:x1-5]
        a,k=unlabel(a,NAMES[r][c]); print(NAMES[r][c],'label px',k)
        cut(a,NAMES[r][c])
