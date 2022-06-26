#include "../consts.h"

static struct tile_info t;

struct area_info area_001 = {
  &t,
  (struct ball_info[]){
    {0}
  },
  (struct pos[]){ { 4, 55 }, { 2, 1 } }, 2
};

static struct tile_info t = { 111, 11, 40, (uint8_t[]){
/*         0   1   2   3   4   5   6   7   8   9  10 */

/*   0*/   2,  2,  2,  1,  1,  1,  1,  1,  2,  2,  2,

/*   1*/   2,  2,  1,  1,  2,  3,  2,  1,  1,  2,  2,

/*   2*/   2,  1,  1,  1,  2,  2,  2,  1,  1,  1,  2,

/*   3*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/*   4*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/*   5*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   6*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*   7*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*   8*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*   9*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  10*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  11*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  12*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  13*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  14*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  15*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  16*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  17*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  18*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  19*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  20*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  21*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  22*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  23*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  24*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  25*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  26*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  27*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  28*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  29*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  30*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  31*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  32*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  33*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  34*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  35*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  36*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  37*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  38*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  39*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  40*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  41*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  42*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  43*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  44*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  45*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  46*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  47*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  48*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  49*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  50*/   2,  2,  0,  0,  0,  0,  0,  0,  0,  2,  2,

/*  51*/   2,  2,  2,  0,  0,  0,  0,  0,  2,  2,  2,

/*  52*/   2,  2,  2,  2,  1,  1,  1,  2,  2,  2,  2,

/*  53*/   2,  2,  2,  1,  1,  1,  1,  1,  2,  2,  2,

/*  54*/   2,  2,  1,  1,  2,  2,  2,  1,  1,  2,  2,

/*  55*/   2,  2,  1,  1,  1,  1,  1,  1,  1,  2,  2,

/*  56*/   2,  2,  1,  1,  2,  2,  2,  1,  1,  2,  2,

/*  57*/   2,  2,  2,  1,  1,  1,  1,  1,  2,  2,  2,

/*  58*/   2,  2,  2,  2,  1,  1,  1,  2,  2,  2,  2,

/*  59*/   2,  2,  2,  0,  0,  0,  0,  0,  2,  2,  2,

/*  60*/   2,  2,  0,  0,  0,  0,  0,  0,  0,  2,  2,

/*  61*/   2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  2,

/*  62*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  63*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  64*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  65*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  66*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  67*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  68*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  69*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  70*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  71*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  72*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  73*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  74*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  75*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  76*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  77*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  78*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  79*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  80*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  81*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  82*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  83*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  84*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  85*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  86*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  87*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  88*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  89*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  90*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  91*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  92*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  93*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/*  94*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/*  95*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/*  96*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/*  97*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  98*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/*  99*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/* 100*/   0,  0,  2,  0,  0,  0,  0,  0,  2,  0,  0,

/* 101*/   0,  0,  0,  2,  0,  0,  0,  2,  0,  0,  0,

/* 102*/   0,  0,  0,  0,  2,  0,  2,  0,  0,  0,  0,

/* 103*/   0,  0,  0,  0,  0,  2,  0,  0,  0,  0,  0,

/* 104*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/* 105*/   0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,

/* 106*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/* 107*/   1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,

/* 108*/   2,  1,  1,  1,  2,  2,  2,  1,  1,  1,  2,

/* 109*/   2,  2,  1,  1,  2,  3,  2,  1,  1,  2,  2,

/* 110*/   2,  2,  2,  1,  1,  1,  1,  1,  2,  2,  2,

/*         0   1   2   3   4   5   6   7   8   9  10 */
  }
};