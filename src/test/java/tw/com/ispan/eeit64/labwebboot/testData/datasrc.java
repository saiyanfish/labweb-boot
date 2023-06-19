package tw.com.ispan.eeit64.labwebboot.testData;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@SpringBootTest
public class datasrc {
    @Autowired
    private DataSource dataSource;

    @Test
    void testdata() throws SQLException {
        Connection conn = dataSource.getConnection();
        Statement stmt = conn.createStatement();
        ResultSet rst = stmt.executeQuery("select * from DEPT");
        while (rst.next()) {
            String r1 = rst.getString(1);
            String r2 = rst.getString(2);
            System.out.println(r1+":"+r2);
        }
        rst.close();
        stmt.close();
        conn.close();
    }
}
