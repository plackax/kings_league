const { getDataFromSheet, searchForTextAndGetPrevRowNum } = require("./data");
const { IMAGES, TEAMS } = require("./maps");
const spreadsheetId = "1hlj7ZHOF71-xLi7ZUv3IAcG6QxSryM-FZ-j7fmjTRvM";

module.exports = function (app) {
  app.get("/clasificaciones", async (req, res) => {
    try {
      const data = await getDataFromSheet(
        spreadsheetId,
        "CLASIFICACIÓN!A7:I19"
      );
      const headers = [];
      data[0].forEach((row, index) => {
        if (index === 0) {
          headers.push("posicion");
          headers.push("equipo");
        } else if (index === 1) {
          headers.push("logo");
        } else {
          headers.push(
            row.toLowerCase().trim().replaceAll(".", "_").replaceAll(" ", "_")
          );
        }
      });
      headers.push("dif_goles");

      const jsonData = data.slice(1).map((row, i) => {
        const rowInfo = row.reduce((json, cell, index) => {
          if (index === 0) {
            json[headers[index]] = i + 1;
            json[headers[index + 1]] = cell;
          } else if (index === 1) {
            const url = IMAGES[json[headers[index]]];
            json[headers[index + 1]] = url;
          } else {
            json[headers[index + 1]] = Number(cell);
          }
          return json;
        }, {});
        rowInfo.dif_goles = rowInfo.goles - rowInfo.g__en_contra;
        return rowInfo;
      });

      return res.json(jsonData);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });

  app.get("/jugadores", async (req, res) => {
    try {
      const { equipo, jugador, mvp, order_by, order } = req.query;
      const data = await getDataFromSheet(
        spreadsheetId,
        "JUGADORES API!A1:K410"
      );

      const jsonData = data
        .slice(1)
        .map((row) => {
          return {
            equipo: row[0],
            dorsal: row[1],
            jugador: row[2],
            p_jugados: Number(row[3]) || 0,
            goles: Number(row[4]) || 0,
            asistencias: Number(row[5]) || 0,
            amarillas: Number(row[6]) || 0,
            rojas: Number(row[7]) || 0,
            g__en_contra: Number(row[8]) || 0,
            pen_parados: Number(row[9]) || 0,
            mvp: Number(row[10]) || 0,
          };
        })
        .filter((row) => row.dorsal)
        .filter((row) => {
          if (!equipo) {
            return true;
          }
          return row.equipo.includes(eqipo);
        })
        .filter((row) => {
          if (!jugador) {
            return true;
          }
          return row.jugador.includes(jugador);
        })
        .filter((row) => {
          if (mvp === undefined) {
            return true;
          }
          return row.mvp === mvp;
        })
        .sort((a, b) => {
          if (order_by) {
            if (order === "desc") {
              return b[order_by] - a[order_by];
            } else {
              return a[order_by] - b[order_by];
            }
          } else {
            return 0;
          }
        });

      return res.json(jsonData);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });
  /**
   * @swagger
   * /equipos/{teamName}:
   *  get:
   *    summary: Retrieve players from a team
   *    parameters:
   *      - name: teamName
   *        in: path
   *        required: true
   *        type: string
   *        enum:
   *          - saiyans
   *          - kunisports
   *          - los_troncos
   *          - unleashed_móstoles
   *          - porcinos
   *          - el_barrio
   *          - rayo_bcn
   *          - xbuyer_team
   *          - aniquiladores
   *          - jijantes
   *          - pio_fc
   *          - 1kfc
   *
   **/
  app.get(`/equipos/:teamName`, async (req, res) => {
    try {
      const teamName = req.params.teamName;
      const team = teamName.toUpperCase().replaceAll("_", " ");

      const data = await getDataFromSheet(spreadsheetId, `${team} DATOS!D3:J3`);

      const jsonData = {
        equipo: team,
        victorias: Number(data[0][0]) || 0,
        derrotas: Number(data[0][1]) || 0,
        goles: Number(data[0][2]) || 0,
        g__en_contra: Number(data[0][3]) || 0,
        dif_goles: Number(data[0][2]) - Number(data[0][3]) || 0,
        asistencias: Number(data[0][4]) || 0,
        amarillas: Number(data[0][5]) || 0,
        rojas: Number(data[0][6]) || 0,
        jugadores: `/equipos/${teamName}/jugadores`,
        ranking_goleadores: `/equipos/${teamName}/ranking_goleadores`,
        ranking_asistencias: `/equipos/${teamName}/ranking_asistencias`,
      };

      return res.json(jsonData);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });

  app.get(`/equipos/:teamName/jugadores`, async (req, res) => {
    try {
      const teamName = req.params.teamName;
      const { order_by, order } = req.query;

      const team = teamName.toUpperCase().replaceAll("_", " ");
      const limitRow = await searchForTextAndGetPrevRowNum(
        spreadsheetId,
        `${team} DATOS!A1:J100`,
        "RANKING ASISTENCIAS"
      );

      const data = await getDataFromSheet(
        spreadsheetId,
        `${team} DATOS!A6:J${limitRow}`
      );

      const jsonData = data
        .map((row) => {
          return {
            dorsal: row[0],
            jugador: row[1],
            p_jugados: Number(row[2]) || 0,
            goles: Number(row[3]) || 0,
            asistencias: Number(row[4]) || 0,
            amarillas: Number(row[5]) || 0,
            rojas: Number(row[6]) || 0,
            g__en_contra: Number(row[7]) || 0,
            pen_parados: Number(row[8]) || 0,
            mvp: Number(row[9]) || 0,
          };
        })
        .filter((row) => row.dorsal)
        .sort((a, b) => {
          if (order_by) {
            if (order === "desc") {
              return b[order_by] - a[order_by];
            } else {
              return a[order_by] - b[order_by];
            }
          } else {
            return 0;
          }
        });

      return res.json(jsonData);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });

  app.get(`/equipos/:teamName/ranking_goleadores`, async (req, res) => {
    try {
      const teamName = req.params.teamName;
      const { order_by, order } = req.query;

      const team = teamName.toUpperCase().replaceAll("_", " ");
      const limitRow = await searchForTextAndGetPrevRowNum(
        spreadsheetId,
        `${team} DATOS!A1:J100`,
        "RANKING ASISTENCIAS"
      );

      const data = await getDataFromSheet(
        spreadsheetId,
        `${team} DATOS!F${limitRow + 2}:G100`
      );

      const jsonData = data
        .map((row) => {
          return {
            jugador: row[0],
            goles: Number(row[1]) || 0,
          };
        })
        .filter((row) => row.jugador)
        .sort((a, b) => {
          if (order_by) {
            if (order === "desc") {
              return b[order_by] - a[order_by];
            } else {
              return a[order_by] - b[order_by];
            }
          } else {
            return 0;
          }
        });

      return res.json(jsonData);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });

  app.get(`/equipos/:teamName/ranking_asistencias`, async (req, res) => {
    try {
      const teamName = req.params.teamName;
      const { order_by, order } = req.query;

      const team = teamName.toUpperCase().replaceAll("_", " ");
      const limitRow = await searchForTextAndGetPrevRowNum(
        spreadsheetId,
        `${team} DATOS!A1:J100`,
        "RANKING ASISTENCIAS"
      );

      const data = await getDataFromSheet(
        spreadsheetId,
        `${team} DATOS!C${limitRow + 2}:D100`
      );

      const jsonData = data
        .map((row) => {
          return {
            jugador: row[0],
            asistencias: Number(row[1]) || 0,
          };
        })
        .filter((row) => row.jugador)
        .sort((a, b) => {
          if (order_by) {
            if (order === "desc") {
              return b[order_by] - a[order_by];
            } else {
              return a[order_by] - b[order_by];
            }
          } else {
            return 0;
          }
        });

      return res.json(jsonData);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  });
};
