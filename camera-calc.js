

  function calculateEulerAnglesAndDraw(center, axisVector, scene) {

      function normalizeVector(vec) {
          const length = Math.sqrt(
              vec[0] * vec[0] +
              vec[1] * vec[1] +
              vec[2] * vec[2]
          );
          return [
              vec[0] / length,
              vec[1] / length,
              vec[2] / length
          ];
      }

      // Funzione per calcolare prodotto vettoriale
      function crossProduct(a, b) {
          return [
              a[1] * b[2] - a[2] * b[1],
              a[2] * b[0] - a[0] * b[2],
              a[0] * b[1] - a[1] * b[0]
          ];
      }

      // Passaggio 1: Normalizzazione del vettore asse
      const axisNormalized = normalizeVector(axisVector);
  //console.log("1. Vettore asse normalizzato:", axisNormalized);

      // Passaggio 2: Creare un vettore perpendicolare
      let perpVector;
      if (Math.abs(axisNormalized[0]) > 0.1) {
          perpVector = [
              axisNormalized[1],
              -axisNormalized[0],
              0
          ];
      } else {
          perpVector = [
              0,
              axisNormalized[2],
              -axisNormalized[1]
          ];
      }
      const perpNormalized = normalizeVector(perpVector);
  //console.log("2. Vettore perpendicolare normalizzato:", perpNormalized);

      // Passaggio 3: Calcolare il terzo vettore (prodotto vettoriale)
      const thirdVector = crossProduct(axisNormalized, perpNormalized);
  //console.log("3. Terzo vettore (prodotto vettoriale):", thirdVector);

      // Passaggio 4: Costruire la matrice di rotazione
      const rotationMatrix = [
          perpNormalized,
          thirdVector,
          axisNormalized
      ];
  //console.log("4. Matrice di rotazione:", rotationMatrix);

      // Passaggio 5: Estrarre gli angoli di Eulero
      function extractEulerAngles(matrix) {
          const sy = Math.sqrt(
              matrix[0][0] * matrix[0][0] +
              matrix[1][0] * matrix[1][0]
          );

          const singular = sy < 1e-6;

          let x, y, z;
          if (!singular) {
              x = Math.atan2(matrix[2][1], matrix[2][2]);
              y = Math.atan2(-matrix[2][0], sy);
              z = Math.atan2(matrix[1][0], matrix[0][0]);
          } else {
              x = Math.atan2(-matrix[1][2], matrix[1][1]);
              y = Math.atan2(-matrix[2][0], sy);
              z = 0;
          }

//console.log("   MYCALC Angoli:", x , y  ,z  , " radianti");
//console.log("   MYCALC Angoli:  roll=", (x * 180 / Math.PI).toFixed(0), ", pitch=",  (y * 180 / Math.PI).toFixed(0) , ", yaw=", (z * 180 / Math.PI).toFixed(0) , " gradi");
          // Conversione in gradi
          return {
              rollRad : x,
              pitchRad : y,
              yawRad : z,
              rollDeg : x * 180 / Math.PI,
              pitchDeg : y * 180 / Math.PI,
              yawDeg : z * 180 / Math.PI
          };
      }

      // Calcolo finale degli angoli
      const eulerAngles = extractEulerAngles(rotationMatrix);

      return {
          axisNormalized          :   axisNormalized,
          perpNormalized          :   perpNormalized,
          thirdVector             :   thirdVector,
          rotationMatrix          :   rotationMatrix,
          rollRad     :   eulerAngles.rollRad,
          pitchRad    :   eulerAngles.pitchRad,
          yawRad      :   eulerAngles.yawRad,
          rollDeg     :   eulerAngles.rollDeg,
          pitchDeg    :   eulerAngles.pitchDeg,
          yawDeg      :   eulerAngles.yawDeg
      };
  }

    // Funzione per convertire quaternione in Euler angles (yaw, pitch, roll)
    function quaternionToEuler(q) { // q.s, q.v1, q.v2, q.v3
        let yaw = Math.atan2(2*(q.s*q.v3 + q.v1*q.v2), 1 - 2*(q.v2*q.v2 + q.v3*q.v3));
        let pitch = Math.asin(2*(q.s*q.v2 - q.v3*q.v1));
        let roll = Math.atan2(2*(q.s*q.v1 + q.v2*q.v3), 1 - 2*(q.v1*q.v1 + q.v2*q.v2));
        return {
            yaw,
			pitch, 
			roll, 
			yawDeg : parseFloat((yaw*180/Math.PI).toFixed(2)),
			pitchDeg : parseFloat((pitch*180/Math.PI).toFixed(2)), 
			rollDeg : parseFloat((roll*180/Math.PI).toFixed(2))
		};
    }
  
