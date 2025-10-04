// not found
  export function notFound(req, res) {
    res.status(404).render('error', { layout: 'main', message: 'Resource not found' });
  }
  
  // server error
  export function serverError(err, req, res, next) { // eslint-disable-line
    console.error(err);
    res.status(500).render('error', { layout: 'main', message: 'An error occurred!' });
  }
  