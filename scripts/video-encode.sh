#!/bin/zsh
# Encode a video's master into the two copies /videos plays.
#
#   scripts/video-encode.sh <master.mp4> <public folder> <film|action|grain>
#   e.g. scripts/video-encode.sh ~/Documents/src/video-escapement/out/escapement-1080p.mp4 \
#          public/films/opus-5-5/escapement film
#
#   film.mp4  the full copy, at the master's size. Encoded to a QUALITY target,
#             not a size: busy moments take the data they need, up to a cap.
#   lite.mp4  the slow-connection copy, 720p at about 1 Mbps. Only made when
#             the folder has none (Library.tsx picks it on a slow connection
#             and falls back to it if the full copy stalls).
#
# The look decides the settings:
#   film    code films at 24 or 30 fps: flat colour, line, glass, ink
#   action  60 fps game footage: fast motion, particles, flashes
#   grain   film grain over the whole frame (the music videos). Grain is
#           expensive and long videos must stay under GitHub's 100 MB file
#           limit, so these take two passes at a fixed 3.3 Mbps instead.
#
# Why this exists: the first copies were squeezed to a size (about 1 to 2 Mbps)
# and went soft or blocky whenever the picture got busy. Measured against the
# masters frame by frame, the trailers spent 5 to 14 of their 21 seconds
# visibly degraded. Never go back to a size target for film.mp4.
#
# The sound is copied from the master untouched, so loudness never changes.
# Run several at once through video-kit/gpu-slot.sh encode.
set -e
master=$1; out=$2; look=$3
[[ -f $master && -d $out && -n $look ]] || { echo "usage: video-encode.sh <master.mp4> <public folder> <film|action|grain>" >&2; exit 64; }
common=(-profile:v high -movflags +faststart -c:a copy)
tmp=$(mktemp -d)

case $look in
  film)   ffmpeg -v error -nostdin -y -i $master -c:v libx264 -preset slow -crf 20 -maxrate 4500k -bufsize 9000k $common $tmp/film.mp4 ;;
  action) ffmpeg -v error -nostdin -y -i $master -c:v libx264 -preset slow -crf 20 -maxrate 12000k -bufsize 24000k $common $tmp/film.mp4 ;;
  grain)
    ffmpeg -v error -nostdin -y -i $master -c:v libx264 -preset slow -b:v 3300k -pass 1 -passlogfile $tmp/p -an -f mp4 /dev/null
    ffmpeg -v error -nostdin -y -i $master -c:v libx264 -preset slow -b:v 3300k -maxrate 6600k -bufsize 13200k -pass 2 -passlogfile $tmp/p $common $tmp/film.mp4 ;;
  *) echo "unknown look: $look (film, action or grain)" >&2; exit 64 ;;
esac
mv $tmp/film.mp4 $out/film.mp4

if [[ ! -f $out/lite.mp4 ]]; then
  ffmpeg -v error -nostdin -y -i $master -vf scale=-2:720:flags=lanczos -c:v libx264 -preset slow -crf 23 -maxrate 1000k -bufsize 2000k \
    -profile:v high -movflags +faststart -c:a aac -b:a 96k $out/lite.mp4
fi
rm -rf $tmp
ls -l $out/film.mp4 $out/lite.mp4 | awk '{printf "%6.1f MB  %s\n", $5/1048576, $9}'
