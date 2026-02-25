why to convert LUTs from .aml to .alf4
0:00
if you are a user of a Alexa cameras
0:02
like Alexa mini or Alexa mini LF these
0:04
cameras were using log C3 color space
0:08
before and the lot format was in AML now
0:11
with Alexa 35 it's not the same lot
0:14
format it have changed from AML to alf4
0:18
because before the AR Alexa mini mini LF
0:21
and the other cameras were using log C3
0:24
color space and now Alexa 35 is using
0:27
log C4 so it's a totally different color
0:30
space now many of dops are having their
0:33
Lots with Alexa mini and Alexa mini LF
0:35
and they want to use these Lots with
0:36
Alexa 35 they give it to me as their dit
0:40
and they tell me like okay let's put
0:42
this lot in Lea 35 for the first time
0:44
when I had to convert this lot I was a
arri support teams comment
0:47
bit confused and I contacted AR support
0:49
team now AR support team replied me
0:52
through an email and they told me that
0:54
these lookup tables which were used with
0:56
Ariel exam Min and Arial exam Min Alf
0:58
were working with log C3 but as we know
1:03
that uh with Alexa 35 we have log C4 we
1:05
will have to really recreate these looks
1:08
but to recreate these lookup tables we
1:10
need to have the DPX file of those lots
1:13
why because surely uh there was being
1:16
done a color space transform from log C3
1:20
to Rex 79 and technically that should be
1:22
deleted and a color space transform
1:25
should be done from loog C4 to Rex 79
most Dops luts are in .aml
1:29
but most of the time when a DP will give
1:31
you a lookup table he will say he's not
1:33
having a DPX file or something he was
1:35
just carrying these AML or do Cube files
1:37
so how can we use these log C3 Lots with
1:40
log C4 I have found a way and I took
1:42
straight two days to do all the research
1:45
and compare them with ar Alexa minf and
1:48
AR Alexa 35 and they work so I'm going
1:50
to send this video to AR support team as
1:53
well and I will ask them if it is
1:55
correct and or not but to me it works uh
1:57
if you are not working with HDR because
2:00
I didn't test it it with HDR workflows I
2:03
just tested it with SDR workflow so to
2:05
do that first of all the question is
conversion from . Aml to .cube
2:07
that your file is in AML or do Cube if
2:11
it is in AML you have to go through one
2:14
more step to convert that from AML to
2:17
Cube and if your file is already in Cube
2:20
the next portion of the video you can
2:22
Skip and you can directly go to the dent
2:24
resolve now to deal with the color and
2:26
LS I was having two uh softwares before
2:30
one was called a color tool and the
2:31
other one was called a reference tool
2:34
now it have become one and I would
2:36
really recommend you to go on AR's
2:38
website before doing anything and
2:39
download every reference tools new
2:41
firmware and it's combining both of them
2:44
and then we can uh go ahead in the video
2:46
I have opened a reference tool now and
2:48
I'm going to show you how to convert AML
2:51
file into Cube so you can use it in D
2:53
resolve so first of all what we need to
2:55
do is we need to come here and we need
2:57
to convert it from log C4 are wi gamut 4
3:00
to logy 3 are wi gamut 3 so now what I
3:04
will do is I will have to go on 3D lot
3:06
and here I will look for let's say this
3:11
slot codc 2383 and I will open it it
3:15
have applied whatever uh the settings
3:17
are and then what I will do is I will
3:19
just come here and I will say export 3D
3:23
lot after that you need to choose the
3:26
mesh size I will go in 33 and I will
3:29
make a new folder called
3:33
test and create that and open and now
3:36
when I will do save it says 3D lot
3:39
export succeeded so I'll go and check it
3:42
I'll go in the lot
3:44
folder test there you go it is in Cube
3:48
now now we have converted the file froml
conversion from logC3 to logC4 LUT
3:50
to do Cube let me just show you how we
3:53
can convert it from loog C3 color space
3:55
to loog C4 color space in D resol I will
3:59
create a new
4:00
project I will call it log C3 to log
4:07
C4 there you go I have a clip from AR
4:10
Alexa 35 and I will import that which is
4:14
this one and it is in log C4
4:18
change and I will import it here now I
4:21
need to apply the L which we converted
4:22
froml to do Cube so I will come into
4:25
color page and then here in color
4:28
management what I'll have have to do is
4:30
I will open the lot
4:32
folder there you go it's being opened
4:35
and on the same time I will open the
4:38
other Lots which I just converted which
4:40
is here and I will just copy it from
4:44
here
4:45
[Music]
4:47
to here I'll call it come on V and there
4:50
you I have a dids codc
4:53
2383 so let's go to here and I will say
4:58
update list now it's updated and I'll go
5:02
save go to
5:04
lot AR and it's
5:08
called now look at it it crushed the
5:10
colors and it's so contrasted this is
5:13
not how it looked here you see it was
5:16
keeping the colors and it was not very
5:18
contrasty and it it acted very weirdly
5:22
here now we need to convert this lot
5:24
from loog C3 to loog C4 which is a
5:27
tricky thing and I will show you how we
5:28
can do it so I will create create a node
5:30
before this shift s and I will bring it
5:33
here I will drag and drop the color
5:36
space transform on this and on the input
5:38
what I'm going to do is I'm going to put
5:40
a white gam 4 and input gamma is going
5:42
to be a log C4 and on the output it will
5:46
be a w gam 3 and a log C3 and now it
5:52
have applied proper lookup table and you
5:55
can see the colors are there and the
5:57
contrast ratio is good I will just
6:00
change one more thing in tone mapping I
6:02
will come here instead of DCI I will go
6:04
luminance mapping we are ready to export
6:06
it so I will come here I will generate
6:09
lot and it should be in 65 point
6:13
Cube and I will make another
6:16
folder it will be A35 lot and I will
6:21
create it there you go and I will save
6:24
it now we have converted this slot from
6:27
log C3 to log C4 let's go to are
conversion from .cube to .alf4 for Alexa 35
6:30
reference to now I have opened it and I
6:32
have imported the same clip which we
6:34
used in DCI resolve and now to uh export
6:38
the lot as Alf and to convert the lot
6:40
from Cub to alf4 uh what I'll do is I'll
6:44
have to come here and first of all uh
6:47
basically this will be by default on are
6:51
color management what you'll have to do
6:52
is you'll have to click on custom color
6:54
management and there you need to skip
6:56
the CDL then you need to skip the C Mt
7:00
and you just go directly on drts here
7:02
what you do is you need to uh go to the
7:05
lot which I exported which is here I
7:08
will open
7:09
it there you go and then I will have the
7:12
same L here as well
7:15
open rex 709 basically this is showing
7:18
the Rex 79 now but now it will change
7:21
I'll go I will go to 2,100 HG and there
7:24
you go this is the lot you can see it's
7:28
same here and here it's very same so now
7:32
to export the lot what you can do is if
7:34
you will come on here it will export it
7:36
is as a do Cube so you'll have to come
outro
7:39
here click there and then click on save
7:42
as and it will ask you where you want to
7:44
save it I will save it on the same
7:47
folder and it will be converted into do
7:49
lf4 now so I will come here I can rename
7:53
it okay and I will save it there you go
7:56
it is being saved here so guys this is
8:00
it and I hope I solved your problem if
8:02
any of the suggestions you can just put
8:04
in the comments and I'm making videos
8:06
only for the bigger Cinema cameras most
8:08
of the time and my audience is very
8:11
small so I would really appreciate if
8:13
you guys could just uh subscribe because
8:15
I'm making videos about any of the
8:18
problem I based on set I will just make
8:20
a video about that and I've already made
8:23
many videos uh about problems and then
8:26
um some things which were being done
8:28
already by
8:30
but I thought it should be done a bit uh
8:32
briefly or in a different way I did
8:35
videos about those things as well so
8:38
thank you so much for watching and uh
8:40
consider subscribing for more videos